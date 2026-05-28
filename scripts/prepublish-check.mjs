import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const options = parseArgs(process.argv.slice(2));
const trackedFiles = git(["ls-files"]).split("\n").filter(Boolean);
const issues = [];
const warnings = [];

requireIgnored(".env");
requireIgnored("deployments/xlayer-mainnet-latest.json");
requireTracked("README.md");
requireTracked("SUBMISSION.md");
requireTracked("docs/okx-form.md");
requireTracked("docs/operator-checklist.md");
requireTracked("docs/assets/demo-screenshot.png");
requireTracked(".github/workflows/ci.yml");
scanTrackedFiles();

if (options.final) {
  requireTracked("PUBLIC_SUBMISSION.md");
  requireNoPlaceholders("PUBLIC_SUBMISSION.md");
  requireNoPlaceholders("SUBMISSION.md", true);
  requireNoPlaceholders("docs/okx-form.md", true);
} else if (!trackedFiles.includes("PUBLIC_SUBMISSION.md")) {
  warnings.push("PUBLIC_SUBMISSION.md is not committed yet. This is expected before live deployment.");
}

if (issues.length > 0) {
  console.error("Prepublish check failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      mode: options.final ? "final" : "standard",
      trackedFiles: trackedFiles.length,
      warnings,
    },
    null,
    2,
  ),
);

function requireIgnored(path) {
  if (trackedFiles.includes(path)) {
    issues.push(`${path} is tracked; remove it from git before publishing.`);
    return;
  }

  const result = spawnGit(["check-ignore", "-q", path]);
  if (result.status !== 0) issues.push(`${path} is not ignored by .gitignore.`);
}

function requireTracked(path) {
  if (!trackedFiles.includes(path)) issues.push(`${path} must be tracked before publishing.`);
  if (!existsSync(path)) issues.push(`${path} is missing from the working tree.`);
}

function requireNoPlaceholders(path, allowTemplate = false) {
  if (!existsSync(path)) return;

  const text = readFileSync(path, "utf8");
  if (/0xmock|https:\/\/github\.com\/example|https:\/\/youtu\.be\/demo|https:\/\/x\.com\/example/i.test(text)) {
    issues.push(`${path} still contains mock URLs or mock hashes.`);
  }

  if (!allowTemplate && /fill_after|replace_with|<your-user>/.test(text)) {
    issues.push(`${path} still contains placeholders.`);
  }
}

function scanTrackedFiles() {
  const privateKeyAssignment = /\bPRIVATE_KEY\s*=\s*0x[0-9a-fA-F]{64}\b/;
  const barePrivateKey = /(?:^|[^0-9a-fA-F])0x[0-9a-fA-F]{64}(?:$|[^0-9a-fA-F])/;

  for (const file of trackedFiles) {
    if (!isTextFile(file) || !existsSync(file)) continue;

    const text = readFileSync(file, "utf8");
    if (privateKeyAssignment.test(text)) {
      issues.push(`${file} appears to contain a concrete PRIVATE_KEY assignment.`);
    }

    if (file.endsWith(".env") && barePrivateKey.test(text)) {
      issues.push(`${file} appears to contain a private key.`);
    }
  }
}

function isTextFile(file) {
  return /\.(sol|js|mjs|json|md|txt|toml|yml|yaml|tsx|ts|css|html|example)$/.test(file);
}

function parseArgs(args) {
  const parsed = {};
  for (const arg of args) {
    if (arg === "--final") parsed.final = true;
  }
  return parsed;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function spawnGit(args) {
  try {
    execFileSync("git", args, { stdio: "ignore" });
    return { status: 0 };
  } catch (error) {
    return { status: error.status ?? 1 };
  }
}
