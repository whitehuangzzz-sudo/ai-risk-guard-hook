import { existsSync } from "node:fs";

const files = {
  env: ".env",
  hook: "deployments/xlayer-mainnet-latest.json",
  tokens: "deployments/xlayer-demo-tokens-latest.json",
  pool: "deployments/xlayer-demo-pool-latest.json",
  summary: "deployments/submission-summary.md",
};
const args = parseArgs(process.argv.slice(2));
const linksProvided = Boolean(args.github && args.verify && args.demo && args.x);
const steps = [
  {
    id: "env",
    ready: existsSync(files.env),
    next: [
      "cp .env.example .env",
      "Fill PRIVATE_KEY, OWNER_ADDRESS, XLAYER_MAINNET_RPC_URL, and XLAYER_MAINNET_POOL_MANAGER in .env.",
    ],
  },
  {
    id: "wallet",
    ready: false,
    next: ["npm run wallet:check"],
    alwaysShowUntil: "hook",
  },
  {
    id: "tokens",
    ready: existsSync(files.tokens),
    next: ["npm run deploy:demo-tokens"],
  },
  {
    id: "hook",
    ready: existsSync(files.hook),
    next: ["npm run deploy:xlayer"],
  },
  {
    id: "pool",
    ready: existsSync(files.pool),
    next: ["npm run pool:configure"],
  },
  {
    id: "summary",
    ready: existsSync(files.summary) && linksProvided,
    next: [
      'npm run submission:finalize -- --github "$GITHUB_URL" --verify "$CONTRACT_VERIFICATION_URL" --demo "$DEMO_VIDEO_URL" --x "$X_ANNOUNCEMENT_URL"',
    ],
  },
  {
    id: "check",
    ready: false,
    next: [
      'npm run submission:check -- --github "$GITHUB_URL" --verify "$CONTRACT_VERIFICATION_URL" --demo "$DEMO_VIDEO_URL" --x "$X_ANNOUNCEMENT_URL"',
    ],
    final: true,
  },
];

const nextStep = steps.find((step) => {
  if (step.id === "wallet") return existsSync(files.env) && !existsSync(files.hook);
  if (step.final) return existsSync(files.pool);
  return !step.ready;
});

if (!nextStep) {
  print({
    status: "local-evidence-ready",
    next: [
      "Record the demo video.",
      "Publish the X announcement.",
      "Submit the OKX form using deployments/submission-summary.md.",
    ],
  });
  process.exit(0);
}

print({
  status: "next-step",
  step: nextStep.id,
  commands: nextStep.next,
  evidence: {
    env: existsSync(files.env),
    hookDeployment: existsSync(files.hook),
    demoTokens: existsSync(files.tokens),
    demoPool: existsSync(files.pool),
    submissionSummary: existsSync(files.summary),
  },
});

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const value = inlineValue ?? rawArgs[index + 1];
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

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}
