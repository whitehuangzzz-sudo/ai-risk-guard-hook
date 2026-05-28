import { existsSync } from "node:fs";

const files = {
  env: ".env",
  hook: "deployments/xlayer-mainnet-latest.json",
  tokens: "deployments/xlayer-demo-tokens-latest.json",
  pool: "deployments/xlayer-demo-pool-latest.json",
  summary: "deployments/submission-summary.md",
  explorerLinks: "deployments/explorer-links.md",
  publicSubmission: "PUBLIC_SUBMISSION.md",
};
const args = parseArgs(process.argv.slice(2));
const linksProvided = Boolean(args.github && args.verify && args.demo && args.x);
const evidence = {
  env: existsSync(files.env),
  hookDeployment: existsSync(files.hook),
  demoTokens: existsSync(files.tokens),
  demoPool: existsSync(files.pool),
  submissionSummary: existsSync(files.summary),
  explorerLinks: existsSync(files.explorerLinks),
  publicSubmission: existsSync(files.publicSubmission),
};
const nextStep = resolveNextStep(evidence, linksProvided);

if (!nextStep) {
  print({
    status: "local-evidence-ready",
    next: [
      "Record the demo video.",
      "Publish the X announcement.",
      "Submit the OKX form using deployments/submission-summary.md.",
    ],
    evidence,
  });
  process.exit(0);
}

print({
  status: "next-step",
  step: nextStep.step,
  commands: nextStep.commands,
  evidence,
});

function resolveNextStep(currentEvidence, hasLinks) {
  if (!currentEvidence.env) {
    return {
      step: "env",
      commands: [
        "cp .env.example .env",
        "Fill PRIVATE_KEY, OWNER_ADDRESS, XLAYER_MAINNET_RPC_URL, and XLAYER_MAINNET_POOL_MANAGER in .env.",
      ],
    };
  }

  if (!currentEvidence.demoTokens) {
    return {
      step: "tokens",
      commands: ["npm run wallet:check", "npm run deploy:demo-tokens"],
    };
  }

  if (!currentEvidence.hookDeployment) {
    return {
      step: "hook",
      commands: ["npm run wallet:check", "npm run deploy:xlayer"],
    };
  }

  if (!currentEvidence.demoPool) {
    return {
      step: "pool",
      commands: ["npm run pool:configure"],
    };
  }

  if (!currentEvidence.submissionSummary || !hasLinks) {
    return {
      step: "summary",
      commands: [
        'npm run submission:finalize -- --github "$GITHUB_URL" --verify "$CONTRACT_VERIFICATION_URL" --demo "$DEMO_VIDEO_URL" --x "$X_ANNOUNCEMENT_URL"',
      ],
    };
  }

  if (!currentEvidence.explorerLinks) {
    return {
      step: "links",
      commands: ["npm run submission:links"],
    };
  }

  if (!currentEvidence.publicSubmission) {
    return {
      step: "public",
      commands: [
        'npm run submission:public -- --github "$GITHUB_URL" --verify "$CONTRACT_VERIFICATION_URL" --demo "$DEMO_VIDEO_URL" --x "$X_ANNOUNCEMENT_URL"',
        'git add PUBLIC_SUBMISSION.md && git commit -m "docs: add public deployment evidence"',
      ],
    };
  }

  return {
    step: "check",
    commands: [
      'npm run submission:check -- --github "$GITHUB_URL" --verify "$CONTRACT_VERIFICATION_URL" --demo "$DEMO_VIDEO_URL" --x "$X_ANNOUNCEMENT_URL"',
    ],
  };
}

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
