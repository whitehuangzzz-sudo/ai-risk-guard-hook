import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("deployments/mock", { recursive: true });
writeFileSync(
  "deployments/mock/deployment.json",
  `${JSON.stringify(
    {
      chainId: 196,
      poolManager: "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
      hookDeployerAddress: "0x1111111111111111111111111111111111111111",
      hookDeployerTx: "0xmockHookDeployerTx",
      hookAddress: "0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080",
      owner: "0x2222222222222222222222222222222222222222",
      hookSaltHex: "0x0000000000000000000000000000000000000000000000000000000000007e0e",
      hookDeployTx: "0xmockHookDeployTx",
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  "deployments/mock/tokens.json",
  `${JSON.stringify(
    {
      chainId: 196,
      token0: "0x0000000000000000000000000000000000001000",
      token1: "0x0000000000000000000000000000000000002000",
      tokenA: { address: "0x0000000000000000000000000000000000002000", tx: "0xmockTokenATx" },
      tokenB: { address: "0x0000000000000000000000000000000000001000", tx: "0xmockTokenBTx" },
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  "deployments/mock/pool.json",
  `${JSON.stringify(
    {
      chainId: 196,
      poolManager: "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
      hookAddress: "0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080",
      poolId: "0xbe236064122ce1f12c2c8f960bfab2b7fcb75c6e88a5ce49fbdf0dba5cb85321",
      poolInitTx: "0xmockPoolInitTx",
      policyTx: "0xmockPolicyTx",
      aiPolicyHash: "0xc8b7b490d19a5688f743269539598a3b04c8b91bfbb5267d82acec32063a923b",
      poolKey: {
        currency0: "0x0000000000000000000000000000000000001000",
        currency1: "0x0000000000000000000000000000000000002000",
        fee: 8388608,
        hooks: "0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080",
      },
    },
    null,
    2,
  )}\n`,
);

const commands = [
  ["forge", ["test"]],
  ["npm", ["run", "app:build"]],
  ["npm", ["run", "operator:next"]],
  ["npm", ["run", "deploy:demo-tokens", "--", "--dry-run", "--skip-build"]],
  ["npm", ["run", "pool:configure", "--", "--dry-run"]],
  ["npm", ["run", "submission:prepublish"]],
  [
    "npm",
    [
      "run",
      "submission:verify-commands",
      "--",
      "--deployment",
      "deployments/mock/deployment.json",
    ],
  ],
  [
    "npm",
    [
      "run",
      "submission:check",
      "--",
      "--allow-mock",
      "--deployment",
      "deployments/mock/deployment.json",
      "--tokens",
      "deployments/mock/tokens.json",
      "--pool",
      "deployments/mock/pool.json",
      "--github",
      "https://github.com/example/ai-risk-guard-hook",
      "--verify",
      "https://www.oklink.com/xlayer/address/0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080",
      "--demo",
      "https://youtu.be/demo",
      "--x",
      "https://x.com/example/status/1",
    ],
  ],
  [
    "npm",
    [
      "run",
      "submission:links",
      "--",
      "--deployment",
      "deployments/mock/deployment.json",
      "--tokens",
      "deployments/mock/tokens.json",
      "--pool",
      "deployments/mock/pool.json",
    ],
  ],
  [
    "npm",
    [
      "run",
      "submission:public",
      "--",
      "--deployment",
      "deployments/mock/deployment.json",
      "--tokens",
      "deployments/mock/tokens.json",
      "--pool",
      "deployments/mock/pool.json",
      "--github",
      "https://github.com/example/ai-risk-guard-hook",
      "--verify",
      "https://www.oklink.com/xlayer/address/0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080",
      "--demo",
      "https://youtu.be/demo",
      "--x",
      "https://x.com/example/status/1",
      "--out",
      "deployments/mock/PUBLIC_SUBMISSION.md",
    ],
  ],
  [
    "npm",
    [
      "run",
      "submission:social",
      "--",
      "--deployment",
      "deployments/mock/deployment.json",
      "--pool",
      "deployments/mock/pool.json",
      "--github",
      "https://github.com/example/ai-risk-guard-hook",
      "--demo",
      "https://youtu.be/demo",
      "--public",
      "https://github.com/example/ai-risk-guard-hook/blob/main/PUBLIC_SUBMISSION.md",
    ],
  ],
  [
    "npm",
    [
      "run",
      "mine:hook",
      "--",
      "0x1111111111111111111111111111111111111111",
      "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
      "0x2222222222222222222222222222222222222222",
    ],
  ],
  [
    "npm",
    [
      "run",
      "policy:calldata",
      "--",
      "0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080",
      "0x0000000000000000000000000000000000001000",
      "0x0000000000000000000000000000000000002000",
      "60",
      "1000000000",
      "500",
      "3000",
      "0",
      "Keep swaps small and raise fees when volatility spikes.",
    ],
  ],
  [
    "npm",
    [
      "run",
      "pool:init",
      "--",
      "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
      "0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080",
      "0x0000000000000000000000000000000000001000",
      "0x0000000000000000000000000000000000002000",
      "60",
    ],
  ],
  ["npm", ["audit", "--audit-level=moderate"]],
];

for (const [command, args] of commands) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nLocal verification passed.");
