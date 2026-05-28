import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { encodeAbiParameters } from "viem";

const options = parseArgs(process.argv.slice(2));
const deployment = readJson(options.deployment || "deployments/xlayer-mainnet-latest.json");
const verifierUrl =
  options.verifierUrl || "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER";
const browserBaseUrl = trimTrailingSlash(options.browserBaseUrl || "https://www.oklink.com/xlayer");
const hookConstructorArgs = encodeAbiParameters(
  [{ type: "address" }, { type: "address" }],
  [deployment.poolManager, deployment.owner],
);
const commands = {
  hookDeployer: [
    "forge verify-contract",
    deployment.hookDeployerAddress,
    "src/HookDeployer.sol:HookDeployer",
    "--chain 196",
    "--verifier oklink",
    `--verifier-url ${verifierUrl}`,
    "--watch",
  ].join(" "),
  hook: [
    "forge verify-contract",
    deployment.hookAddress,
    "src/AIRiskGuardHook.sol:AIRiskGuardHook",
    "--chain 196",
    "--verifier oklink",
    `--verifier-url ${verifierUrl}`,
    `--constructor-args ${hookConstructorArgs}`,
    "--watch",
  ].join(" "),
};
const lines = [
  "# OKLink Verification Commands",
  "",
  "Wait at least one minute after deployment before verifying. X Layer's official Foundry verification flow uses OKLink as the verifier.",
  "",
  "## HookDeployer",
  "",
  "```bash",
  commands.hookDeployer,
  "```",
  "",
  "## AIRiskGuardHook",
  "",
  "```bash",
  commands.hook,
  "```",
  "",
  "## Explorer URLs",
  "",
  `HookDeployer: ${browserBaseUrl}/address/${deployment.hookDeployerAddress}`,
  `AI Risk Guard Hook: ${browserBaseUrl}/address/${deployment.hookAddress}`,
  "",
];

mkdirSync("deployments", { recursive: true });
writeFileSync("deployments/verification-commands.md", lines.join("\n"));
console.log(lines.join("\n"));
console.log("Wrote deployments/verification-commands.md");

function readJson(path) {
  if (!existsSync(path)) {
    console.error(`Missing deployment file: ${path}`);
    process.exit(1);
  }

  const value = JSON.parse(readFileSync(path, "utf8"));
  for (const key of ["poolManager", "owner", "hookDeployerAddress", "hookAddress"]) {
    if (!value[key]) {
      console.error(`Deployment file is missing ${key}: ${path}`);
      process.exit(1);
    }
  }
  return value;
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
