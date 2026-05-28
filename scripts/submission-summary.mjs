import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const options = parseArgs(process.argv.slice(2));
const deploymentPath = options.deployment || "deployments/xlayer-mainnet-latest.json";

if (!existsSync(deploymentPath)) {
  console.error(`Deployment file not found: ${deploymentPath}`);
  console.error("Run npm run deploy:xlayer first, or pass a deployment JSON path.");
  process.exit(1);
}

const deployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
const links = {
  github: options.github || "fill_after_github_publish",
  demo: options.demo || "fill_after_video_upload",
  xPost: options.x || "fill_after_x_post",
  verify: options.verify || "fill_after_verify",
};
const pool = {
  id: options.poolId || "fill_after_pool_initialize",
  initTx: options.poolInitTx || "fill_after_pool_initialize",
  policyTx: options.policyTx || "fill_after_set_policy",
};
const lines = [
  "# Submission Summary",
  "",
  "| Item | Value |",
  "| --- | --- |",
  `| Chain | X Layer mainnet (${deployment.chainId}) |`,
  `| PoolManager | \`${deployment.poolManager || ""}\` |`,
  `| HookDeployer address | \`${deployment.hookDeployerAddress || ""}\` |`,
  `| HookDeployer tx | \`${deployment.hookDeployerTx || ""}\` |`,
  `| AI Risk Guard Hook address | \`${deployment.hookAddress || ""}\` |`,
  `| Hook deployment tx | \`${deployment.hookDeployTx || ""}\` |`,
  `| Hook salt | \`${deployment.hookSaltHex || ""}\` |`,
  `| PoolId | \`${pool.id}\` |`,
  `| Pool initialization tx | \`${pool.initTx}\` |`,
  `| Policy configuration tx | \`${pool.policyTx}\` |`,
  `| Contract verification URL | ${links.verify} |`,
  `| GitHub repository | ${links.github} |`,
  `| Demo video URL | ${links.demo} |`,
  `| X announcement URL | ${links.xPost} |`,
  "",
  "## Suggested OKX Description",
  "",
  "AI Risk Guard Hook turns plain-language retail risk preferences into an enforceable Uniswap v4 `beforeSwap` policy on X Layer. It supports exact-input swap limits, dynamic LP fee overrides for elevated risk, and blocked-mode circuit breaking. AI helps author the policy; Solidity enforces it.",
  "",
  "## OKX Form Copy",
  "",
  "```text",
  "Project name: AI Risk Guard Hook",
  `GitHub repository: ${links.github}`,
  `Demo video: ${links.demo}`,
  `X announcement: ${links.xPost}`,
  "",
  "Network: X Layer mainnet, chain id 196",
  `PoolManager: ${deployment.poolManager || ""}`,
  `HookDeployer address: ${deployment.hookDeployerAddress || ""}`,
  `HookDeployer tx: ${deployment.hookDeployerTx || ""}`,
  `AI Risk Guard Hook address: ${deployment.hookAddress || ""}`,
  `Hook deployment tx: ${deployment.hookDeployTx || ""}`,
  `PoolId: ${pool.id}`,
  `Pool initialization tx: ${pool.initTx}`,
  `Policy configuration tx: ${pool.policyTx}`,
  `Contract verification URL: ${links.verify}`,
  "```",
  "",
];

const out = "deployments/submission-summary.md";
mkdirSync("deployments", { recursive: true });
writeFileSync(out, `${lines.join("\n")}\n`);
console.log(lines.join("\n"));
console.log(`\nWrote ${out}`);

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      if (!parsed.deployment) parsed.deployment = arg;
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
