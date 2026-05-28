import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const deploymentPath = process.argv[2] || "deployments/xlayer-mainnet-latest.json";

if (!existsSync(deploymentPath)) {
  console.error(`Deployment file not found: ${deploymentPath}`);
  console.error("Run npm run deploy:xlayer first, or pass a deployment JSON path.");
  process.exit(1);
}

const deployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
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
  "| Pool address / PoolId | fill after pool initialization |",
  "| Pool initialization tx | fill after pool initialization |",
  "| Policy configuration tx | fill after setPolicy |",
  "| Contract verification URL | fill after verification |",
  "| Demo video URL | fill after upload |",
  "| X announcement URL | fill after posting |",
  "",
  "## Suggested OKX Description",
  "",
  "AI Risk Guard Hook turns plain-language retail risk preferences into an enforceable Uniswap v4 `beforeSwap` policy on X Layer. It supports exact-input swap limits, dynamic LP fee overrides for elevated risk, and blocked-mode circuit breaking. AI helps author the policy; Solidity enforces it.",
  "",
];

const out = "deployments/submission-summary.md";
mkdirSync("deployments", { recursive: true });
writeFileSync(out, `${lines.join("\n")}\n`);
console.log(lines.join("\n"));
console.log(`\nWrote ${out}`);
