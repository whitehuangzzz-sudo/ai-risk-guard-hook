import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  concatHex,
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  getCreate2Address,
  http,
  isAddress,
  keccak256,
  padHex,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const BEFORE_SWAP_FLAG = 1 << 7;
const ALL_HOOK_MASK = (1 << 14) - 1;
const MAX_LOOP = 1_000_000;
const DEFAULT_POOL_MANAGER = "0x360e68faccca8ca495c1b759fd9eee466db9fb32";
const SAMPLE_FACTORY = "0x1111111111111111111111111111111111111111";
const SAMPLE_OWNER = "0x2222222222222222222222222222222222222222";
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipBuild = args.has("--skip-build");

loadDotEnv(".env");

if (!skipBuild) run("forge", ["build"]);

const poolManager = normalizeAddress(
  "XLAYER_MAINNET_POOL_MANAGER",
  process.env.XLAYER_MAINNET_POOL_MANAGER || DEFAULT_POOL_MANAGER,
);
const owner = normalizeAddress("OWNER_ADDRESS", process.env.OWNER_ADDRESS || (dryRun ? SAMPLE_OWNER : ""));

if (dryRun) {
  const mined = mineHookAddress(SAMPLE_FACTORY, poolManager, owner);
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        hookDeployerAddress: SAMPLE_FACTORY,
        poolManager,
        owner,
        ...mined,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const rpcUrl = requiredEnv("XLAYER_MAINNET_RPC_URL");
const privateKey = normalizePrivateKey(requiredEnv("PRIVATE_KEY"));
const account = privateKeyToAccount(privateKey);
const chain = {
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
};
const transport = http(rpcUrl);
const publicClient = createPublicClient({ chain, transport });
const walletClient = createWalletClient({ account, chain, transport });
const hookDeployerArtifact = readArtifact("out/HookDeployer.sol/HookDeployer.json");

console.log(`Deploying HookDeployer from ${account.address}...`);
const deployerHash = await walletClient.deployContract({
  abi: hookDeployerArtifact.abi,
  bytecode: bytecodeOf(hookDeployerArtifact),
  account,
});
const deployerReceipt = await publicClient.waitForTransactionReceipt({ hash: deployerHash });
if (!deployerReceipt.contractAddress) throw new Error("HookDeployer receipt has no contractAddress");

const hookDeployerAddress = deployerReceipt.contractAddress;
console.log(`HookDeployer: ${hookDeployerAddress}`);

const mined = mineHookAddress(hookDeployerAddress, poolManager, owner);
console.log(`Mined Hook: ${mined.hookAddress} salt=${mined.saltHex}`);

const deployHookHash = await walletClient.sendTransaction({
  account,
  to: hookDeployerAddress,
  data: mined.deployCalldata,
});
const hookReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHookHash });

const result = {
  chainId: 196,
  deployer: account.address,
  poolManager,
  owner,
  hookDeployerAddress,
  hookDeployerTx: deployerHash,
  hookAddress: mined.hookAddress,
  hookSalt: mined.salt,
  hookSaltHex: mined.saltHex,
  hookDeployTx: deployHookHash,
  hookDeployBlock: hookReceipt.blockNumber.toString(),
  deployCalldata: mined.deployCalldata,
};

mkdirSync("deployments", { recursive: true });
writeFileSync("deployments/xlayer-mainnet-latest.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
console.log("Wrote deployments/xlayer-mainnet-latest.json");

function mineHookAddress(deployer, manager, hookOwner) {
  const normalizedDeployer = normalizeAddress("hookDeployer", deployer);
  const normalizedPoolManager = normalizeAddress("poolManager", manager);
  const normalizedOwner = normalizeAddress("owner", hookOwner);
  const artifact = readArtifact("out/AIRiskGuardHook.sol/AIRiskGuardHook.json");
  const constructorArgs = encodeAbiParameters(
    [{ type: "address" }, { type: "address" }],
    [normalizedPoolManager, normalizedOwner],
  );
  const initCode = concatHex([bytecodeOf(artifact), constructorArgs]);
  const initCodeHash = keccak256(initCode);
  const deployAbi = [
    {
      type: "function",
      name: "deployAIRiskGuardHook",
      stateMutability: "nonpayable",
      inputs: [
        { name: "salt", type: "bytes32" },
        { name: "poolManager", type: "address" },
        { name: "owner", type: "address" },
      ],
      outputs: [{ name: "hook", type: "address" }],
    },
  ];

  for (let salt = 0; salt < MAX_LOOP; salt += 1) {
    const saltHex = padHex(toHex(salt), { size: 32 });
    const hookAddress = getCreate2Address({
      from: normalizedDeployer,
      salt: saltHex,
      bytecodeHash: initCodeHash,
    });
    if ((BigInt(hookAddress) & BigInt(ALL_HOOK_MASK)) === BigInt(BEFORE_SWAP_FLAG)) {
      return {
        hookAddress,
        salt,
        saltHex,
        flags: "BEFORE_SWAP",
        deployCalldata: encodeFunctionData({
          abi: deployAbi,
          functionName: "deployAIRiskGuardHook",
          args: [saltHex, normalizedPoolManager, normalizedOwner],
        }),
      };
    }
  }

  throw new Error(`No hook salt found within ${MAX_LOOP} attempts`);
}

function run(command, commandArgs) {
  console.log(`$ ${command} ${commandArgs.join(" ")}`);
  const result = spawnSync(command, commandArgs, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function readArtifact(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function bytecodeOf(artifact) {
  return artifact.bytecode.object.startsWith("0x") ? artifact.bytecode.object : `0x${artifact.bytecode.object}`;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function loadDotEnv(path) {
  if (!existsSync(path)) return;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function normalizeAddress(label, value) {
  const normalized = value.toLowerCase();
  if (!isAddress(normalized, { strict: false })) throw new Error(`Invalid ${label} address: ${value}`);
  return normalized;
}

function normalizePrivateKey(value) {
  const normalized = value.startsWith("0x") ? value : `0x${value}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) throw new Error("PRIVATE_KEY must be a 32-byte hex string");
  return normalized;
}
