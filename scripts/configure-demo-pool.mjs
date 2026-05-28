import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  http,
  keccak256,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadDotEnv, normalizeAddress, normalizePrivateKey, requiredEnv } from "./env-utils.mjs";

const DEFAULT_SQRT_PRICE_X96 = 2n ** 96n;
const DYNAMIC_FEE = 0x800000;
const SAMPLE_POOL_MANAGER = "0x360e68faccca8ca495c1b759fd9eee466db9fb32";
const SAMPLE_HOOK = "0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080";
const SAMPLE_TOKEN0 = "0x0000000000000000000000000000000000001000";
const SAMPLE_TOKEN1 = "0x0000000000000000000000000000000000002000";
const DEFAULT_POLICY = {
  tickSpacing: 60,
  maxExactInputAmount: 1_000_000_000n,
  normalFee: 500,
  elevatedFee: 3000,
  riskMode: 0,
  prompt: "Keep swaps small and raise fees when volatility spikes.",
};
const args = parseArgs(process.argv.slice(2));
const dryRun = args.dryRun === true;

loadDotEnv(".env");

const deployment = readJson(args.deployment || "deployments/xlayer-mainnet-latest.json", dryRun);
const tokenDeployment = readJson(args.tokens || "deployments/xlayer-demo-tokens-latest.json", dryRun);
const poolManager = normalizeAddress(
  "poolManager",
  args.poolManager || deployment.poolManager || process.env.XLAYER_MAINNET_POOL_MANAGER || SAMPLE_POOL_MANAGER,
);
const hookAddress = normalizeAddress("hookAddress", args.hook || deployment.hookAddress || SAMPLE_HOOK);
const token0 = normalizeAddress("token0", args.token0 || tokenDeployment.token0 || SAMPLE_TOKEN0);
const token1 = normalizeAddress("token1", args.token1 || tokenDeployment.token1 || SAMPLE_TOKEN1);
const policy = {
  tickSpacing: numberArg("tick-spacing", args.tickSpacing, DEFAULT_POLICY.tickSpacing),
  maxExactInputAmount: bigintArg("max-exact-input", args.maxExactInput, DEFAULT_POLICY.maxExactInputAmount),
  normalFee: numberArg("normal-fee", args.normalFee, DEFAULT_POLICY.normalFee),
  elevatedFee: numberArg("elevated-fee", args.elevatedFee, DEFAULT_POLICY.elevatedFee),
  riskMode: numberArg("risk-mode", args.riskMode, DEFAULT_POLICY.riskMode),
  prompt: args.prompt || DEFAULT_POLICY.prompt,
  sqrtPriceX96: bigintArg("sqrt-price-x96", args.sqrtPriceX96, DEFAULT_SQRT_PRICE_X96),
};

validateInputs(token0, token1, policy);

const poolKeyType = {
  type: "tuple",
  components: [
    { name: "currency0", type: "address" },
    { name: "currency1", type: "address" },
    { name: "fee", type: "uint24" },
    { name: "tickSpacing", type: "int24" },
    { name: "hooks", type: "address" },
  ],
};
const poolKey = {
  currency0: token0,
  currency1: token1,
  fee: DYNAMIC_FEE,
  tickSpacing: policy.tickSpacing,
  hooks: hookAddress,
};
const poolId = keccak256(encodeAbiParameters([poolKeyType], [poolKey]));
const aiPolicyHash = keccak256(stringToHex(policy.prompt));
const poolManagerAbi = [
  {
    type: "function",
    name: "initialize",
    stateMutability: "nonpayable",
    inputs: [
      { name: "key", ...poolKeyType },
      { name: "sqrtPriceX96", type: "uint160" },
    ],
    outputs: [{ name: "tick", type: "int24" }],
  },
];
const hookAbi = [
  {
    type: "function",
    name: "setPolicy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "key", ...poolKeyType },
      { name: "maxExactInputAmount", type: "uint128" },
      { name: "normalFee", type: "uint24" },
      { name: "elevatedFee", type: "uint24" },
      { name: "riskMode", type: "uint8" },
      { name: "aiPolicyHash", type: "bytes32" },
    ],
    outputs: [],
  },
];
const initializeCalldata = encodeFunctionData({
  abi: poolManagerAbi,
  functionName: "initialize",
  args: [poolKey, policy.sqrtPriceX96],
});
const setPolicyCalldata = encodeFunctionData({
  abi: hookAbi,
  functionName: "setPolicy",
  args: [
    poolKey,
    policy.maxExactInputAmount,
    policy.normalFee,
    policy.elevatedFee,
    policy.riskMode,
    aiPolicyHash,
  ],
});

if (dryRun) {
  printResult({
    mode: "dry-run",
    poolManager,
    hookAddress,
    poolKey,
    poolId,
    aiPolicyHash,
    initializeCalldata,
    setPolicyCalldata,
    policy: printablePolicy(policy),
  });
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

console.log(`Initializing pool ${poolId} from ${account.address}...`);
const poolInitTx = await walletClient.sendTransaction({
  account,
  to: poolManager,
  data: initializeCalldata,
});
const poolInitReceipt = await publicClient.waitForTransactionReceipt({ hash: poolInitTx });

console.log(`Setting policy on Hook ${hookAddress}...`);
const policyTx = await walletClient.sendTransaction({
  account,
  to: hookAddress,
  data: setPolicyCalldata,
});
const policyReceipt = await publicClient.waitForTransactionReceipt({ hash: policyTx });

const result = {
  chainId: 196,
  operator: account.address,
  poolManager,
  hookAddress,
  poolKey,
  poolId,
  aiPolicyHash,
  poolInitTx,
  poolInitBlock: poolInitReceipt.blockNumber.toString(),
  policyTx,
  policyBlock: policyReceipt.blockNumber.toString(),
  policy: printablePolicy(policy),
};

mkdirSync("deployments", { recursive: true });
writeFileSync("deployments/xlayer-demo-pool-latest.json", `${JSON.stringify(result, null, 2)}\n`);
printResult(result);
console.log("Wrote deployments/xlayer-demo-pool-latest.json");

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }
    if (!arg.startsWith("--")) continue;

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const value = inlineValue ?? rawArgs[index + 1];
    if (inlineValue === undefined) index += 1;
    if (!value || value.startsWith("--")) fail(`Missing value for --${rawKey}`);
    parsed[toCamelCase(rawKey)] = value;
  }
  return parsed;
}

function readJson(path, allowMissing) {
  if (!existsSync(path)) {
    if (allowMissing) return {};
    fail(`Missing ${path}. Run npm run deploy:demo-tokens and npm run deploy:xlayer first.`);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function validateInputs(currency0, currency1, currentPolicy) {
  if (BigInt(currency0) >= BigInt(currency1)) fail("token0 must be numerically lower than token1.");
  if (!Number.isInteger(currentPolicy.tickSpacing) || currentPolicy.tickSpacing <= 0) {
    fail("tick-spacing must be a positive integer.");
  }
  if (!Number.isInteger(currentPolicy.normalFee) || currentPolicy.normalFee < 0 || currentPolicy.normalFee > 1_000_000) {
    fail("normal-fee must be 0..1000000.");
  }
  if (
    !Number.isInteger(currentPolicy.elevatedFee) ||
    currentPolicy.elevatedFee < 0 ||
    currentPolicy.elevatedFee > 1_000_000
  ) {
    fail("elevated-fee must be 0..1000000.");
  }
  if (!Number.isInteger(currentPolicy.riskMode) || currentPolicy.riskMode < 0 || currentPolicy.riskMode > 2) {
    fail("risk-mode must be 0, 1, or 2.");
  }
  if (currentPolicy.sqrtPriceX96 <= 0n || currentPolicy.sqrtPriceX96 > 2n ** 160n - 1n) {
    fail("sqrt-price-x96 must fit uint160.");
  }
}

function numberArg(label, value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) fail(`${label} must be an integer.`);
  return parsed;
}

function bigintArg(label, value, fallback) {
  if (value === undefined) return fallback;
  try {
    return BigInt(value);
  } catch {
    fail(`${label} must be an integer.`);
  }
}

function printablePolicy(currentPolicy) {
  return {
    tickSpacing: currentPolicy.tickSpacing,
    maxExactInputAmount: currentPolicy.maxExactInputAmount.toString(),
    normalFee: currentPolicy.normalFee,
    elevatedFee: currentPolicy.elevatedFee,
    riskMode: currentPolicy.riskMode,
    prompt: currentPolicy.prompt,
    sqrtPriceX96: currentPolicy.sqrtPriceX96.toString(),
  };
}

function printResult(result) {
  console.log(JSON.stringify(result, (_key, value) => (typeof value === "bigint" ? value.toString() : value), 2));
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
