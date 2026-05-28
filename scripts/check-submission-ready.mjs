import { existsSync, readFileSync } from "node:fs";
import { isAddress } from "viem";

const options = parseArgs(process.argv.slice(2));
const paths = {
  deployment: options.deployment || "deployments/xlayer-mainnet-latest.json",
  tokens: options.tokens || "deployments/xlayer-demo-tokens-latest.json",
  pool: options.pool || "deployments/xlayer-demo-pool-latest.json",
};
const issues = [];
const allowMock = options.allowMock === true;
const deployment = readJson("deployment", paths.deployment);
const tokens = readJson("tokens", paths.tokens);
const pool = readJson("pool", paths.pool);

requireEqual("deployment.chainId", deployment.chainId, 196);
requireAddress("deployment.poolManager", deployment.poolManager);
requireAddress("deployment.hookDeployerAddress", deployment.hookDeployerAddress);
requireTx("deployment.hookDeployerTx", deployment.hookDeployerTx);
requireAddress("deployment.hookAddress", deployment.hookAddress);
requireTx("deployment.hookDeployTx", deployment.hookDeployTx);
requireBytes32("deployment.hookSaltHex", deployment.hookSaltHex);

requireEqual("tokens.chainId", tokens.chainId, 196);
requireAddress("tokens.token0", tokens.token0);
requireAddress("tokens.token1", tokens.token1);
if (tokens.token0 && tokens.token1 && BigInt(tokens.token0) >= BigInt(tokens.token1)) {
  issues.push("tokens.token0 must be numerically lower than tokens.token1.");
}
requireTokenTx("tokens.token0 deployment tx", tokens, tokens.token0);
requireTokenTx("tokens.token1 deployment tx", tokens, tokens.token1);

requireEqual("pool.chainId", pool.chainId, 196);
requireAddress("pool.poolManager", pool.poolManager);
requireAddress("pool.hookAddress", pool.hookAddress);
requireBytes32("pool.poolId", pool.poolId);
requireTx("pool.poolInitTx", pool.poolInitTx);
requireTx("pool.policyTx", pool.policyTx);
requireBytes32("pool.aiPolicyHash", pool.aiPolicyHash);

if (deployment.poolManager && pool.poolManager && deployment.poolManager.toLowerCase() !== pool.poolManager.toLowerCase()) {
  issues.push("deployment.poolManager and pool.poolManager do not match.");
}
if (deployment.hookAddress && pool.hookAddress && deployment.hookAddress.toLowerCase() !== pool.hookAddress.toLowerCase()) {
  issues.push("deployment.hookAddress and pool.hookAddress do not match.");
}
if (pool.poolKey) {
  if (pool.poolKey.currency0?.toLowerCase() !== tokens.token0?.toLowerCase()) {
    issues.push("pool.poolKey.currency0 does not match tokens.token0.");
  }
  if (pool.poolKey.currency1?.toLowerCase() !== tokens.token1?.toLowerCase()) {
    issues.push("pool.poolKey.currency1 does not match tokens.token1.");
  }
  if (pool.poolKey.hooks?.toLowerCase() !== deployment.hookAddress?.toLowerCase()) {
    issues.push("pool.poolKey.hooks does not match deployment.hookAddress.");
  }
  if (pool.poolKey.fee !== 0x800000) issues.push("pool.poolKey.fee must be 0x800000 for a dynamic-fee pool.");
}

requireUrl("github", options.github);
requireUrl("verify", options.verify);
requireUrl("demo", options.demo);
requireUrl("x", options.x);

if (issues.length > 0) {
  console.error("Submission readiness check failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: "ready",
      chainId: deployment.chainId,
      hookAddress: deployment.hookAddress,
      token0: tokens.token0,
      token1: tokens.token1,
      poolId: pool.poolId,
      links: {
        github: options.github,
        verify: options.verify,
        demo: options.demo,
        x: options.x,
      },
    },
    null,
    2,
  ),
);

function readJson(label, path) {
  if (!existsSync(path)) {
    issues.push(`Missing ${label} file: ${path}`);
    return {};
  }

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    issues.push(`Invalid JSON in ${label} file: ${path} (${error.message})`);
    return {};
  }
}

function requireEqual(label, actual, expected) {
  if (actual !== expected) issues.push(`${label} must be ${expected}, got ${actual ?? "missing"}.`);
}

function requireAddress(label, value) {
  if (!value || hasPlaceholder(value) || !isAddress(value, { strict: false })) {
    issues.push(`${label} must be a real address.`);
  }
}

function requireTx(label, value) {
  if (allowMock && /^0x[a-zA-Z0-9_-]+$/.test(value || "")) return;
  if (!isHexLength(value, 32)) issues.push(`${label} must be a 32-byte transaction hash.`);
}

function requireBytes32(label, value) {
  if (!isHexLength(value, 32)) issues.push(`${label} must be a 32-byte hex value.`);
}

function requireTokenTx(label, tokenDeployment, tokenAddress) {
  const token = [tokenDeployment.tokenA, tokenDeployment.tokenB].find(
    (candidate) => candidate?.address?.toLowerCase() === tokenAddress?.toLowerCase(),
  );
  requireTx(label, token?.tx);
}

function requireUrl(label, value) {
  if (!value || hasPlaceholder(value)) {
    issues.push(`${label} URL is required.`);
    return;
  }

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) issues.push(`${label} URL must start with http or https.`);
  } catch {
    issues.push(`${label} URL is not valid.`);
  }
}

function isHexLength(value, bytes) {
  return typeof value === "string" && new RegExp(`^0x[0-9a-fA-F]{${bytes * 2}}$`).test(value) && !hasPlaceholder(value);
}

function hasPlaceholder(value) {
  return typeof value === "string" && /fill_after|replace_with|<your-user>/.test(value);
}

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;

    if (arg === "--allow-mock") {
      parsed.allowMock = true;
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const value = inlineValue ?? args[index + 1];
    if (inlineValue === undefined) index += 1;
    if (!value || value.startsWith("--")) {
      console.error(`Missing value for --${rawKey}`);
      process.exit(1);
    }
    parsed[toCamelCase(rawKey)] = value;
  }

  return parsed;
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}
