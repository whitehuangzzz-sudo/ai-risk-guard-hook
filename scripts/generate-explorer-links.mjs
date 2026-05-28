import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const options = parseArgs(process.argv.slice(2));
const baseUrl = trimTrailingSlash(options.baseUrl || "https://www.oklink.com/xlayer");
const deployment = readJson(options.deployment || "deployments/xlayer-mainnet-latest.json");
const tokens = readJson(options.tokens || "deployments/xlayer-demo-tokens-latest.json", true);
const pool = readJson(options.pool || "deployments/xlayer-demo-pool-latest.json", true);
const token0Tx = findTokenTx(tokens, tokens.token0);
const token1Tx = findTokenTx(tokens, tokens.token1);
const rows = [
  ["PoolManager", "address", deployment.poolManager],
  ["HookDeployer", "address", deployment.hookDeployerAddress],
  ["HookDeployer tx", "tx", deployment.hookDeployerTx],
  ["AI Risk Guard Hook", "address", deployment.hookAddress],
  ["Hook deployment tx", "tx", deployment.hookDeployTx],
  ["Token0", "address", tokens.token0],
  ["Token0 deployment tx", "tx", token0Tx],
  ["Token1", "address", tokens.token1],
  ["Token1 deployment tx", "tx", token1Tx],
  ["Pool initialization tx", "tx", pool.poolInitTx],
  ["Policy configuration tx", "tx", pool.policyTx],
].filter(([, , value]) => Boolean(value));
const lines = [
  "# Explorer Links",
  "",
  "| Item | Link |",
  "| --- | --- |",
  ...rows.map(([label, type, value]) => `| ${label} | [${value}](${baseUrl}/${type}/${value}) |`),
  "",
  "## Copy Block",
  "",
  "```text",
  ...rows.map(([label, type, value]) => `${label}: ${baseUrl}/${type}/${value}`),
  "```",
  "",
];

mkdirSync("deployments", { recursive: true });
writeFileSync("deployments/explorer-links.md", lines.join("\n"));
console.log(lines.join("\n"));
console.log("Wrote deployments/explorer-links.md");

function readJson(path, optional = false) {
  if (!existsSync(path)) {
    if (optional) return {};
    console.error(`Missing file: ${path}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function findTokenTx(tokenDeployment, address) {
  if (!address) return "";
  const token = [tokenDeployment.tokenA, tokenDeployment.tokenB].find(
    (candidate) => candidate?.address?.toLowerCase() === address.toLowerCase(),
  );
  return token?.tx || "";
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;

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

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}
