# Operator Checklist

Use this when the deployer wallet and X account are ready.

## Do Not Paste Secrets Into Chat

Keep `PRIVATE_KEY` local. Put it in `.env` or export it in your shell. Do not paste it into an AI chat, issue, README, or X post.

## 1. Prepare Environment

```bash
cp .env.example .env
```

Fill:

- `PRIVATE_KEY`
- `OWNER_ADDRESS`
- `XLAYER_MAINNET_RPC_URL`
- `XLAYER_MAINNET_POOL_MANAGER=0x360e68faccca8ca495c1b759fd9eee466db9fb32`

Load the env:

```bash
set -a
source .env
set +a
```

## 2. Verify Locally

```bash
npm run verify
```

Expected: `Local verification passed.`

## 3. Deploy HookDeployer

Fast path:

```bash
npm run deploy:xlayer
```

This deploys `HookDeployer`, mines a valid `BEFORE_SWAP` Hook address, deploys `AIRiskGuardHook`, and writes non-secret output to `deployments/xlayer-mainnet-latest.json`.

Manual path:

```bash
forge create src/HookDeployer.sol:HookDeployer \
  --rpc-url "$XLAYER_MAINNET_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

Save:

- HookDeployer address
- transaction hash

Set:

```bash
export HOOK_DEPLOYER_ADDRESS=replace_with_deployed_factory
```

## 4. Mine Hook Address

Skip this if you used `npm run deploy:xlayer`.

```bash
npm run mine:hook -- \
  "$HOOK_DEPLOYER_ADDRESS" \
  "$XLAYER_MAINNET_POOL_MANAGER" \
  "$OWNER_ADDRESS"
```

Save:

- `hookAddress`
- `saltHex`
- `deployCalldata`

Set:

```bash
export HOOK_ADDRESS=replace_with_predicted_hook
export SALT_HEX=replace_with_salt_hex
```

## 5. Deploy Hook

Skip this if you used `npm run deploy:xlayer`.

```bash
cast send "$HOOK_DEPLOYER_ADDRESS" \
  "deployAIRiskGuardHook(bytes32,address,address)" \
  "$SALT_HEX" \
  "$XLAYER_MAINNET_POOL_MANAGER" \
  "$OWNER_ADDRESS" \
  --rpc-url "$XLAYER_MAINNET_RPC_URL" \
  --private-key "$PRIVATE_KEY"
```

Save:

- AI Risk Guard Hook address
- transaction hash

## 6. Create Dynamic-Fee Pool

Create or initialize a Uniswap v4 pool with:

- `hooks = $HOOK_ADDRESS`
- `fee = 0x800000`
- `tickSpacing = 60`
- your chosen token pair

Save:

- PoolId
- pool initialization transaction hash

## 7. Generate Policy Calldata

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

Run the printed `castCommands.setPolicy`.

Save:

- Policy configuration transaction hash

## 8. Record Demo

Use `docs/demo-video-script.md`.

Show:

- demo app interaction;
- `forge test`;
- deployment evidence if available;
- final Hook and Pool addresses.

## 9. Publish X Post

Use the suggested post in `SUBMISSION.md`.

Required tags:

- `@XLayerOfficial`
- `@Uniswap`
- `@flapdotsh`

Save:

- X announcement URL

## 10. Submit On OKX Event Page

Submit before `2026-05-28 23:59 UTC`.

Fill the table in `SUBMISSION.md` before submitting.
