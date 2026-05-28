import { encodeAbiParameters, encodeFunctionData, isAddress, keccak256 } from "viem";

const DEFAULT_SQRT_PRICE_X96 = 2n ** 96n;
const DYNAMIC_FEE = 0x800000;
const usage = [
  "Usage:",
  "node scripts/encode-pool-init-calldata.mjs <poolManager> <hookAddress> <currency0> <currency1> <tickSpacing> [sqrtPriceX96]",
  "",
  "currency0 must be numerically lower than currency1.",
  "sqrtPriceX96 defaults to 2^96, a 1:1 initial price.",
].join("\n");

const [, , poolManager, hookAddress, currency0, currency1, tickSpacingArg, sqrtPriceX96Arg] = process.argv;

if (!poolManager || !hookAddress || !currency0 || !currency1 || !tickSpacingArg) {
  console.error(usage);
  process.exit(1);
}

const normalizedPoolManager = normalizeAddress("poolManager", poolManager);
const normalizedHook = normalizeAddress("hookAddress", hookAddress);
const normalizedCurrency0 = normalizeAddress("currency0", currency0);
const normalizedCurrency1 = normalizeAddress("currency1", currency1);
const tickSpacing = Number(tickSpacingArg);
const sqrtPriceX96 = sqrtPriceX96Arg ? BigInt(sqrtPriceX96Arg) : DEFAULT_SQRT_PRICE_X96;

if (BigInt(normalizedCurrency0) >= BigInt(normalizedCurrency1)) {
  fail("currency0 must be numerically lower than currency1 for Uniswap v4 PoolKey.");
}
if (!Number.isInteger(tickSpacing) || tickSpacing <= 0) fail("tickSpacing must be a positive integer");
if (sqrtPriceX96 <= 0n || sqrtPriceX96 > (2n ** 160n - 1n)) fail("sqrtPriceX96 must fit uint160");

const poolKey = {
  currency0: normalizedCurrency0,
  currency1: normalizedCurrency1,
  fee: DYNAMIC_FEE,
  tickSpacing,
  hooks: normalizedHook,
};
const poolKeyType = {
  type: "tuple",
  components: [
    { name: "currency0", type: "address" },
    { name: "currency1", type: "address" },
    { name: "fee", type: "uint24" },
    { name: "tickSpacing", type: "int24" },
    { name: "hooks", type: "address" },
  ],
};
const poolManagerAbi = [
  {
    type: "function",
    name: "initialize",
    stateMutability: "nonpayable",
    inputs: [
      { name: "key", ...poolKeyType },
      { name: "sqrtPriceX96", type: "uint160" },
    ],
    outputs: [{ name: "tick", type: "int24" }],
  },
];

const poolId = keccak256(encodeAbiParameters([poolKeyType], [poolKey]));
const initializeCalldata = encodeFunctionData({
  abi: poolManagerAbi,
  functionName: "initialize",
  args: [poolKey, sqrtPriceX96],
});

console.log(
  JSON.stringify(
    {
      poolManager: normalizedPoolManager,
      poolKey,
      poolId,
      sqrtPriceX96: sqrtPriceX96.toString(),
      initializeCalldata,
      castCommand: `cast send ${normalizedPoolManager} "initialize((address,address,uint24,int24,address),uint160)" "(${normalizedCurrency0},${normalizedCurrency1},${DYNAMIC_FEE},${tickSpacing},${normalizedHook})" ${sqrtPriceX96} --rpc-url "$XLAYER_MAINNET_RPC_URL" --private-key "$PRIVATE_KEY"`,
    },
    null,
    2,
  ),
);

function normalizeAddress(label, value) {
  const normalized = value.toLowerCase();
  if (!isAddress(normalized, { strict: false })) fail(`Invalid ${label}: ${value}`);
  return normalized;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
