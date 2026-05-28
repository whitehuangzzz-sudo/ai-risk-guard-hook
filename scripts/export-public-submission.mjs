import { existsSync, readFileSync, writeFileSync } from "node:fs";

const options = parseArgs(process.argv.slice(2));
const baseUrl = trimTrailingSlash(options.baseUrl || "https://www.oklink.com/xlayer");
const out = options.out || "PUBLIC_SUBMISSION.md";
const deployment = readJson(options.deployment || "deployments/xlayer-mainnet-latest.json");
const tokens = readJson(options.tokens || "deployments/xlayer-demo-tokens-latest.json", true);
const pool = readJson(options.pool || "deployments/xlayer-demo-pool-latest.json", true);
const github = options.github || "fill_after_github_publish";
const demo = options.demo || "fill_after_video_upload";
const xPost = options.x || "fill_after_x_post";
const verify = options.verify || link("address", deployment.hookAddress || "fill_after_verify");
const token0Tx = findTokenTx(tokens, tokens.token0);
const token1Tx = findTokenTx(tokens, tokens.token1);
const rows = [
  ["Chain", `X Layer mainnet (${deployment.chainId || 196})`],
  ["PoolManager", addressLink(deployment.poolManager)],
  ["HookDeployer", addressLink(deployment.hookDeployerAddress)],
  ["HookDeployer tx", txLink(deployment.hookDeployerTx)],
  ["AI Risk Guard Hook", addressLink(deployment.hookAddress)],
  ["Hook deployment tx", txLink(deployment.hookDeployTx)],
  ["Token0", addressLink(tokens.token0)],
  ["Token0 deployment tx", txLink(token0Tx)],
  ["Token1", addressLink(tokens.token1)],
  ["Token1 deployment tx", txLink(token1Tx)],
  ["PoolId", code(pool.poolId)],
  ["Pool initialization tx", txLink(pool.poolInitTx)],
  ["Policy configuration tx", txLink(pool.policyTx)],
  ["Contract verification", markdownLink(verify)],
  ["GitHub repository", markdownLink(github)],
  ["Demo video", markdownLink(demo)],
  ["X announcement", markdownLink(xPost)],
].filter(([, value]) => value);
const lines = [
  "# AI Risk Guard Hook Public Submission",
  "",
  "AI Risk Guard Hook is an OKX Hook the Future submission for X Layer. It turns plain-language retail risk preferences into an enforceable Uniswap v4 `beforeSwap` policy with swap limits, dynamic LP fee overrides, and circuit-breaker mode.",
  "",
  "AI helps author the policy. Solidity enforces it.",
  "",
  "## On-Chain Evidence",
  "",
  "| Item | Value |",
  "| --- | --- |",
  ...rows.map(([label, value]) => `| ${label} | ${value} |`),
  "",
  "## Verification",
  "",
  "```bash",
  "npm install",
  "npm --prefix app install",
  "npm run verify",
  "```",
  "",
  "Expected result: `Local verification passed.`",
  "",
  "## Repository Pointers",
  "",
  "- Hook contract: `src/AIRiskGuardHook.sol`",
  "- CREATE2 factory: `src/HookDeployer.sol`",
  "- Demo token contract: `src/DemoERC20.sol`",
  "- Demo app: `app/`",
  "- Operator runbook: `docs/operator-checklist.md`",
  "- OKX form copy pack: `docs/okx-form.md`",
  "",
];

writeFileSync(out, `${lines.join("\n")}\n`);
console.log(`Wrote ${out}`);

function readJson(path, optional = false) {
  if (!existsSync(path)) {
    if (optional) return {};
    console.error(`Missing file: ${path}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function addressLink(value) {
  return value ? `[${value}](${link("address", value)})` : "";
}

function txLink(value) {
  return value ? `[${value}](${link("tx", value)})` : "";
}

function markdownLink(value) {
  if (!value) return "";
  return `[${value}](${value})`;
}

function code(value) {
  return value ? `\`${value}\`` : "";
}

function link(type, value) {
  return `${baseUrl}/${type}/${value}`;
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
