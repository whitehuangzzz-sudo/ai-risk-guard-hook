import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadDotEnv, normalizeAddress, normalizePrivateKey, requiredEnv } from "./env-utils.mjs";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipBuild = args.has("--skip-build");
const SAMPLE_OWNER = "0x2222222222222222222222222222222222222222";
const SUPPLY = 1_000_000n * 10n ** 18n;

loadDotEnv(".env");

if (!skipBuild) run("forge", ["build"]);

const recipient = normalizeAddress("OWNER_ADDRESS", process.env.OWNER_ADDRESS || (dryRun ? SAMPLE_OWNER : ""));

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        recipient,
        tokens: [
          { name: "AI Risk Demo Token A", symbol: "AIRD-A", supply: SUPPLY.toString() },
          { name: "AI Risk Demo Token B", symbol: "AIRD-B", supply: SUPPLY.toString() },
        ],
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
const artifact = readArtifact("out/DemoERC20.sol/DemoERC20.json");

const tokenA = await deployToken("AI Risk Demo Token A", "AIRD-A");
const tokenB = await deployToken("AI Risk Demo Token B", "AIRD-B");
const sorted = [tokenA, tokenB].sort((a, b) => (BigInt(a.address) < BigInt(b.address) ? -1 : 1));
const result = {
  chainId: 196,
  deployer: account.address,
  recipient,
  tokenA,
  tokenB,
  token0: sorted[0].address,
  token1: sorted[1].address,
};

mkdirSync("deployments", { recursive: true });
writeFileSync("deployments/xlayer-demo-tokens-latest.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
console.log("Wrote deployments/xlayer-demo-tokens-latest.json");

async function deployToken(name, symbol) {
  console.log(`Deploying ${symbol} from ${account.address}...`);
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: bytecodeOf(artifact),
    args: [name, symbol, recipient, SUPPLY],
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error(`${symbol} receipt has no contractAddress`);

  return {
    name,
    symbol,
    address: receipt.contractAddress,
    tx: hash,
    block: receipt.blockNumber.toString(),
    supply: SUPPLY.toString(),
  };
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
