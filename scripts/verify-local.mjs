import { spawnSync } from "node:child_process";

const commands = [
  ["forge", ["test"]],
  ["npm", ["run", "app:build"]],
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
