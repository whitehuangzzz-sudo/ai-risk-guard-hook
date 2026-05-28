import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const options = parseArgs(process.argv.slice(2));
const deployment = readJson(options.deployment || "deployments/xlayer-mainnet-latest.json", true);
const pool = readJson(options.pool || "deployments/xlayer-demo-pool-latest.json", true);
const github = options.github || "fill_after_github_publish";
const demo = options.demo || "fill_after_video_upload";
const publicSubmission = options.public || "fill_after_public_submission";
const hookAddress = deployment.hookAddress || "fill_after_hook_address";
const poolId = pool.poolId || "fill_after_pool_id";
const xPost = [
  "AI Risk Guard Hook is my @XLayerOfficial Hook the Future submission.",
  "",
  "It turns plain-language risk preferences into a Uniswap v4 beforeSwap Hook policy: max swap size, dynamic risk fees, and circuit breaker mode.",
  "",
  "AI writes the policy. Solidity enforces it.",
  "",
  `Hook: ${hookAddress}`,
  `PoolId: ${poolId}`,
  `Repo: ${github}`,
  "",
  "@Uniswap @flapdotsh",
].join("\n");
const xPostChinese = [
  "我做了一个 OKX Hook the Future 参赛项目：AI Risk Guard Hook。",
  "",
  "它把普通用户的风险偏好，转换成 Uniswap v4 beforeSwap Hook 策略：最大交换额、动态风险费率、熔断模式。",
  "",
  "AI 负责写策略，Solidity 负责执行。",
  "",
  `Hook: ${hookAddress}`,
  `PoolId: ${poolId}`,
  `Repo: ${github}`,
  "",
  "@XLayerOfficial @Uniswap @flapdotsh",
].join("\n");
const videoDescription = [
  "AI Risk Guard Hook - OKX Hook the Future submission",
  "",
  "AI Risk Guard Hook turns plain-language retail risk preferences into an enforceable Uniswap v4 beforeSwap policy on X Layer.",
  "",
  "What it shows:",
  "- AI-assisted policy authoring",
  "- exact-input swap limits",
  "- dynamic LP fee overrides",
  "- blocked-mode circuit breaker",
  "- X Layer deployment evidence",
  "",
  `GitHub: ${github}`,
  `Public submission: ${publicSubmission}`,
  `Demo: ${demo}`,
  `Hook: ${hookAddress}`,
  `PoolId: ${poolId}`,
  "",
  "AI writes the policy. Solidity enforces it.",
].join("\n");
const okxShortDescription = [
  "AI Risk Guard Hook turns plain-language retail risk preferences into an enforceable Uniswap v4 beforeSwap policy on X Layer. It supports exact-input swap limits, dynamic LP fee overrides, and blocked-mode circuit breaking. AI helps author the policy; Solidity enforces it.",
].join("\n");
const okxWalletFeedback = [
  "@OKXWallet_CN 给活动页提一个小建议：能不能加一个“一键复制 Markdown”按钮？",
  "",
  "把活动规则、提交要求、截止时间、官方链接和标签要求整理成 Markdown，普通参赛者就可以直接粘给 Claude Code / Codex / ChatGPT 做头脑风暴、拆需求、生成提交清单。",
  "",
  "现在黑客松越来越像“想法 + AI 执行力”的比赛，活动信息越适合 AI 读取，普通人越容易参赛。",
].join("\n");
const lines = [
  "# Social Copy Pack",
  "",
  "## X Post",
  "",
  "```text",
  xPost,
  "```",
  "",
  "## X Post Chinese",
  "",
  "```text",
  xPostChinese,
  "```",
  "",
  "## Video Description",
  "",
  "```text",
  videoDescription,
  "```",
  "",
  "## OKX Short Description",
  "",
  "```text",
  okxShortDescription,
  "```",
  "",
  "## OKX Wallet Feedback",
  "",
  "```text",
  okxWalletFeedback,
  "```",
  "",
];

mkdirSync("deployments", { recursive: true });
writeFileSync("deployments/social-posts.md", lines.join("\n"));
console.log(lines.join("\n"));
console.log("Wrote deployments/social-posts.md");

function readJson(path, optional = false) {
  if (!existsSync(path)) {
    if (optional) return {};
    console.error(`Missing file: ${path}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, "utf8"));
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
