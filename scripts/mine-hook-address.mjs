import { readFileSync } from "node:fs";
import { concatHex, encodeAbiParameters, getCreate2Address, isAddress, keccak256, padHex, toHex } from "viem";

const BEFORE_SWAP_FLAG = 1 << 7;
const ALL_HOOK_MASK = (1 << 14) - 1;
const MAX_LOOP = 1_000_000;

const [, , deployer, poolManager, owner] = process.argv;

if (!deployer || !poolManager || !owner) {
  console.error("Usage: node scripts/mine-hook-address.mjs <hookDeployer> <poolManager> <owner>");
  process.exit(1);
}

const normalizedDeployer = deployer.toLowerCase();
const normalizedPoolManager = poolManager.toLowerCase();
const normalizedOwner = owner.toLowerCase();

for (const [label, value] of [
  ["hookDeployer", normalizedDeployer],
  ["poolManager", normalizedPoolManager],
  ["owner", normalizedOwner],
]) {
  if (!isAddress(value, { strict: false })) {
    console.error(`Invalid ${label} address: ${value}`);
    process.exit(1);
  }
}

const artifact = JSON.parse(readFileSync("out/AIRiskGuardHook.sol/AIRiskGuardHook.json", "utf8"));
const bytecode = artifact.bytecode.object.startsWith("0x")
  ? artifact.bytecode.object
  : `0x${artifact.bytecode.object}`;
const constructorArgs = encodeAbiParameters(
  [{ type: "address" }, { type: "address" }],
  [normalizedPoolManager, normalizedOwner],
);
const initCode = concatHex([bytecode, constructorArgs]);
const initCodeHash = keccak256(initCode);

for (let salt = 0; salt < MAX_LOOP; salt += 1) {
  const saltHex = padHex(toHex(salt), { size: 32 });
  const address = getCreate2Address({
    from: normalizedDeployer,
    salt: saltHex,
    bytecodeHash: initCodeHash,
  });
  if ((BigInt(address) & BigInt(ALL_HOOK_MASK)) === BigInt(BEFORE_SWAP_FLAG)) {
    console.log(
      JSON.stringify(
        {
          hookAddress: address,
          salt,
          saltHex,
          flags: "BEFORE_SWAP",
          deployCall: `deployAIRiskGuardHook(${saltHex}, ${normalizedPoolManager}, ${normalizedOwner})`,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
}

console.error(`No salt found within ${MAX_LOOP} attempts`);
process.exit(1);
