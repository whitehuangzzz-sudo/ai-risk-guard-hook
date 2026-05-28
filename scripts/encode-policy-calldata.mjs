import {
  encodeAbiParameters,
  encodeFunctionData,
  isAddress,
  keccak256,
  stringToHex,
} from "viem";

const usage = [
  "Usage:",
  "node scripts/encode-policy-calldata.mjs \\",
  "  <hookAddress> <currency0> <currency1> <tickSpacing> \\",
  "  <maxExactInputAmount> <normalFee> <elevatedFee> <riskMode> <policyPrompt>",
  "",
  "riskMode: 0=Normal, 1=Elevated, 2=Blocked",
].join("\n");

const [
  ,
  ,
  hookAddress,
  currency0,
  currency1,
  tickSpacingArg,
  maxExactInputAmountArg,
  normalFeeArg,
  elevatedFeeArg,
  riskModeArg,
  ...promptParts
] = process.argv;

if (
  !hookAddress ||
  !currency0 ||
  !currency1 ||
  !tickSpacingArg ||
  !maxExactInputAmountArg ||
  !normalFeeArg ||
  !elevatedFeeArg ||
  !riskModeArg ||
  promptParts.length === 0
) {
  console.error(usage);
  process.exit(1);
}

const prompt = promptParts.join(" ");
const normalizedHook = normalizeAddress("hookAddress", hookAddress);
const normalizedCurrency0 = normalizeAddress("currency0", currency0);
const normalizedCurrency1 = normalizeAddress("currency1", currency1);
const tickSpacing = Number(tickSpacingArg);
const maxExactInputAmount = BigInt(maxExactInputAmountArg);
const normalFee = Number(normalFeeArg);
const elevatedFee = Number(elevatedFeeArg);
const riskMode = Number(riskModeArg);
const dynamicFee = 0x800000;

if (!Number.isInteger(tickSpacing) || tickSpacing <= 0) fail("tickSpacing must be a positive integer");
if (!Number.isInteger(normalFee) || normalFee < 0 || normalFee > 1_000_000) fail("normalFee must be 0..1000000");
if (!Number.isInteger(elevatedFee) || elevatedFee < 0 || elevatedFee > 1_000_000) {
  fail("elevatedFee must be 0..1000000");
}
if (!Number.isInteger(riskMode) || riskMode < 0 || riskMode > 2) fail("riskMode must be 0, 1, or 2");

const poolKey = {
  currency0: normalizedCurrency0,
  currency1: normalizedCurrency1,
  fee: dynamicFee,
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
const encodedPoolKey = encodeAbiParameters([poolKeyType], [poolKey]);
const poolId = keccak256(encodedPoolKey);
const aiPolicyHash = keccak256(stringToHex(prompt));
const hookAbi = [
  {
    type: "function",
    name: "setPolicy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "key", ...poolKeyType },
      { name: "maxExactInputAmount", type: "uint128" },
      { name: "normalFee", type: "uint24" },
      { name: "elevatedFee", type: "uint24" },
      { name: "riskMode", type: "uint8" },
      { name: "aiPolicyHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setRiskMode",
    stateMutability: "nonpayable",
    inputs: [
      { name: "key", ...poolKeyType },
      { name: "riskMode", type: "uint8" },
    ],
    outputs: [],
  },
];

console.log(
  JSON.stringify(
    {
      hookAddress: normalizedHook,
      poolKey,
      poolId,
      aiPolicyHash,
      setPolicyArgs: [poolKey, maxExactInputAmount.toString(), normalFee, elevatedFee, riskMode, aiPolicyHash],
      setPolicyCalldata: encodeFunctionData({
        abi: hookAbi,
        functionName: "setPolicy",
        args: [poolKey, maxExactInputAmount, normalFee, elevatedFee, riskMode, aiPolicyHash],
      }),
      setRiskModeCalldata: {
        normal: encodeFunctionData({ abi: hookAbi, functionName: "setRiskMode", args: [poolKey, 0] }),
        elevated: encodeFunctionData({ abi: hookAbi, functionName: "setRiskMode", args: [poolKey, 1] }),
        blocked: encodeFunctionData({ abi: hookAbi, functionName: "setRiskMode", args: [poolKey, 2] }),
      },
      castCommands: {
        setPolicy: `cast send ${normalizedHook} "setPolicy((address,address,uint24,int24,address),uint128,uint24,uint24,uint8,bytes32)" "(${normalizedCurrency0},${normalizedCurrency1},${dynamicFee},${tickSpacing},${normalizedHook})" ${maxExactInputAmount} ${normalFee} ${elevatedFee} ${riskMode} ${aiPolicyHash} --rpc-url "$XLAYER_MAINNET_RPC_URL" --private-key "$PRIVATE_KEY"`,
        setRiskModeElevated: `cast send ${normalizedHook} "setRiskMode((address,address,uint24,int24,address),uint8)" "(${normalizedCurrency0},${normalizedCurrency1},${dynamicFee},${tickSpacing},${normalizedHook})" 1 --rpc-url "$XLAYER_MAINNET_RPC_URL" --private-key "$PRIVATE_KEY"`,
        setRiskModeBlocked: `cast send ${normalizedHook} "setRiskMode((address,address,uint24,int24,address),uint8)" "(${normalizedCurrency0},${normalizedCurrency1},${dynamicFee},${tickSpacing},${normalizedHook})" 2 --rpc-url "$XLAYER_MAINNET_RPC_URL" --private-key "$PRIVATE_KEY"`,
      },
    },
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
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
