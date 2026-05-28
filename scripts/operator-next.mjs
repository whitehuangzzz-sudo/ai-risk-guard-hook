import { existsSync, readFileSync } from "node:fs";

const files = {
  env: ".env",
  hook: "deployments/xlayer-mainnet-latest.json",
  tokens: "deployments/xlayer-demo-tokens-latest.json",
  pool: "deployments/xlayer-demo-pool-latest.json",
  verificationCommands: "deployments/verification-commands.md",
  summary: "deployments/submission-summary.md",
  explorerLinks: "deployments/explorer-links.md",
  publicSubmission: "PUBLIC_SUBMISSION.md",
  socialPosts: "deployments/social-posts.md",
};
const args = parseArgs(process.argv.slice(2));
const socialInputsProvided = Boolean(args.github && args.demo);
const finalLinksProvided = Boolean(args.github && args.verify && args.demo && args.x);
const deployment = readJson(files.hook);
const tokens = readJson(files.tokens);
const pool = readJson(files.pool);
const evidence = {
  env: existsSync(files.env),
  hookDeployment: hasLiveHookDeployment(deployment),
  verificationCommands: hasFreshMarkdown(files.verificationCommands, [
    deployment?.hookDeployerAddress,
    deployment?.hookAddress,
    deployment?.poolManager,
    deployment?.owner,
  ]),
  demoTokens: hasLiveTokenDeployment(tokens),
  demoPool: hasLivePoolDeployment(pool, deployment, tokens),
  submissionSummary: hasFreshMarkdown(files.summary, [deployment?.hookAddress, deployment?.hookDeployTx, pool?.poolId, pool?.policyTx]),
  explorerLinks: hasFreshMarkdown(files.explorerLinks, [
    deployment?.hookAddress,
    deployment?.hookDeployTx,
    tokens?.token0,
    tokens?.token1,
    pool?.poolInitTx,
    pool?.policyTx,
  ]),
  publicSubmission: hasFreshMarkdown(files.publicSubmission, [
    deployment?.hookAddress,
    deployment?.hookDeployTx,
    pool?.poolId,
    pool?.poolInitTx,
    pool?.policyTx,
  ]),
  socialPosts: hasFreshMarkdown(files.socialPosts, [deployment?.hookAddress, pool?.poolId], true),
};
const nextStep = resolveNextStep(evidence, socialInputsProvided, finalLinksProvided);

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

function resolveNextStep(currentEvidence, hasSocialInputs, hasFinalLinks) {
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

  if (!currentEvidence.verificationCommands) {
    return {
      step: "verification",
      commands: [
        "npm run submission:verify-commands",
        "Run the printed forge verify-contract commands after the deployment is indexed, then save the Hook OKLink URL as CONTRACT_VERIFICATION_URL.",
      ],
    };
  }

  if (!currentEvidence.demoPool) {
    return {
      step: "pool",
      commands: ["npm run pool:configure"],
    };
  }

  if (!currentEvidence.explorerLinks) {
    return {
      step: "links",
      commands: ["npm run submission:links"],
    };
  }

  if (!currentEvidence.socialPosts || !hasSocialInputs) {
    return {
      step: "social",
      commands: [
        'npm run submission:social -- --github "$GITHUB_URL" --demo "$DEMO_VIDEO_URL" --public "$PUBLIC_SUBMISSION_URL"',
        "Post to X, then save the resulting X post URL as X_ANNOUNCEMENT_URL.",
      ],
    };
  }

  if (!currentEvidence.submissionSummary || !hasFinalLinks) {
    return {
      step: "summary",
      commands: [
        'npm run submission:finalize -- --github "$GITHUB_URL" --verify "$CONTRACT_VERIFICATION_URL" --demo "$DEMO_VIDEO_URL" --x "$X_ANNOUNCEMENT_URL"',
      ],
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

function readJson(path) {
  if (!existsSync(path)) return null;

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function hasLiveHookDeployment(value) {
  return (
    value?.chainId === 196 &&
    isAddressLike(value.poolManager) &&
    isAddressLike(value.hookDeployerAddress) &&
    isAddressLike(value.hookAddress) &&
    isBytes32(value.hookDeployerTx) &&
    isBytes32(value.hookDeployTx) &&
    isBytes32(value.hookSaltHex)
  );
}

function hasLiveTokenDeployment(value) {
  return (
    value?.chainId === 196 &&
    isAddressLike(value.token0) &&
    isAddressLike(value.token1) &&
    value.token0.toLowerCase() !== value.token1.toLowerCase() &&
    isBytes32(findTokenTx(value, value.token0)) &&
    isBytes32(findTokenTx(value, value.token1))
  );
}

function hasLivePoolDeployment(value, hookDeployment, tokenDeployment) {
  return (
    value?.chainId === 196 &&
    isBytes32(value.poolId) &&
    isBytes32(value.poolInitTx) &&
    isBytes32(value.policyTx) &&
    isBytes32(value.aiPolicyHash) &&
    value.poolManager?.toLowerCase() === hookDeployment?.poolManager?.toLowerCase() &&
    value.hookAddress?.toLowerCase() === hookDeployment?.hookAddress?.toLowerCase() &&
    value.poolKey?.currency0?.toLowerCase() === tokenDeployment?.token0?.toLowerCase() &&
    value.poolKey?.currency1?.toLowerCase() === tokenDeployment?.token1?.toLowerCase()
  );
}

function hasFreshMarkdown(path, requiredValues, allowMissingLinks = false) {
  if (!existsSync(path)) return false;

  const text = readFileSync(path, "utf8");
  if (/fill_after|replace_with|0xmock/i.test(text)) return false;
  if (!allowMissingLinks && /https:\/\/github\.com\/example|https:\/\/youtu\.be\/demo|https:\/\/x\.com\/example/i.test(text)) {
    return false;
  }

  const concreteValues = requiredValues.filter(Boolean);
  return concreteValues.length > 0 && concreteValues.every((value) => text.toLowerCase().includes(value.toLowerCase()));
}

function findTokenTx(tokenDeployment, address) {
  if (!address) return "";
  const token = [tokenDeployment?.tokenA, tokenDeployment?.tokenB].find(
    (candidate) => candidate?.address?.toLowerCase() === address.toLowerCase(),
  );
  return token?.tx || "";
}

function isAddressLike(value) {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);
}

function isBytes32(value) {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);
}
