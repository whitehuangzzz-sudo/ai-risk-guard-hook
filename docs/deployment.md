# Deployment Runbook

This runbook gets AI Risk Guard Hook from local demo to a deployable X Layer artifact.

## Known X Layer Addresses

Uniswap's official v4 deployment list includes X Layer mainnet, chain id `196`.

| Contract | Address |
| --- | --- |
| PoolManager | `0x360e68faccca8ca495c1b759fd9eee466db9fb32` |
| PositionManager | `0xcf1eafc6928dc385a342e7c6491d371d2871458b` |
| StateView | `0x76fd297e2d437cd7f76d50f01afe6160f86e9990` |
| Universal Router | `0xda00ae15d3a71466517129255255db7c0c0956d3` |

The repository also keeps X Layer testnet RPC settings, but the official Uniswap v4 deployment list currently gives the complete X Layer deployment set for mainnet.

## Environment

```bash
cp .env.example .env
```

Fill:

- `PRIVATE_KEY`: deployer wallet private key.
- `OWNER_ADDRESS`: policy owner/operator address.
- `XLAYER_MAINNET_RPC_URL`: X Layer mainnet RPC endpoint.

## Step 1: Deploy HookDeployer

`HookDeployer` is a small CREATE2 factory. Deploy it normally first:

```bash
forge create src/HookDeployer.sol:HookDeployer \
  --rpc-url "$XLAYER_MAINNET_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

Copy the deployed address into `HOOK_DEPLOYER_ADDRESS`.

## Step 2: Mine a Hook Salt

Build the contracts, then find a salt that makes `AIRiskGuardHook` deploy to an address with the Uniswap v4 `BEFORE_SWAP` permission bit:

```bash
forge build

npm run mine:hook -- \
  "$HOOK_DEPLOYER_ADDRESS" \
  "$XLAYER_MAINNET_POOL_MANAGER" \
  "$OWNER_ADDRESS"
```

The script prints:

- predicted Hook address;
- integer salt;
- `bytes32` salt;
- exact `deployAIRiskGuardHook(...)` call shape.
- ABI calldata for the `deployAIRiskGuardHook(...)` call.

## Step 3: Deploy the Hook Through CREATE2

Use the mined `saltHex`:

```bash
cast send "$HOOK_DEPLOYER_ADDRESS" \
  "deployAIRiskGuardHook(bytes32,address,address)" \
  "$SALT_HEX" \
  "$XLAYER_MAINNET_POOL_MANAGER" \
  "$OWNER_ADDRESS" \
  --rpc-url "$XLAYER_MAINNET_RPC_URL" \
  --private-key "$PRIVATE_KEY"
```

Check the transaction logs for `HookDeployed`.

## Step 4: Create a Dynamic-Fee v4 Pool

Create or initialize a Uniswap v4 pool whose:

- `hooks` field is the deployed AI Risk Guard Hook address;
- `fee` field is `0x800000`, Uniswap v4's dynamic fee flag;
- currencies and tick spacing match the demo pair.

The Hook returns dynamic LP fee overrides only for dynamic-fee pools.

## Step 5: Configure Policy

After pool creation, generate `setPolicy` calldata with the exact `PoolKey`, for example:

- max exact input amount: `1000000000` for a 1,000 USDT limit on a 6-decimal token;
- normal fee: `500` for 0.05%;
- elevated fee: `3000` for 0.3%;
- risk mode: `0` for Normal;
- AI policy hash: hash of the prompt or policy JSON.

```bash
npm run policy:calldata -- \
  "$HOOK_ADDRESS" \
  "$TOKEN0" \
  "$TOKEN1" \
  60 \
  1000000000 \
  500 \
  3000 \
  0 \
  "Keep swaps small and raise fees when volatility spikes."
```

The script prints:

- `PoolKey`;
- `PoolId`;
- AI policy hash;
- `setPolicy` calldata;
- `setRiskMode` calldata for Normal, Elevated, and Blocked;
- copy-ready `cast send` commands.

Use `setRiskMode` during the demo to switch between Normal, Elevated, and Blocked modes.

## Submission Evidence

Collect these before submitting:

- HookDeployer transaction hash.
- AI Risk Guard Hook address.
- Pool creation or initialization transaction hash.
- Policy configuration transaction hash.
- OKLink contract verification URL.
- Demo video URL.
