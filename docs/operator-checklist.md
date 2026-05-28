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

`npm run deploy:xlayer` reads `.env` automatically. Shell environment variables still override `.env` values.

## 2. Verify Locally

```bash
npm run verify
npm run wallet:check
```

Expected:

- `Local verification passed.`
- `wallet:check` reports chain id `196`, matching owner/private key, and non-zero gas balance.

## 3. Deploy HookDeployer

Fast path:

```bash
npm run wallet:check
npm run deploy:xlayer
```

This deploys `HookDeployer`, mines a valid `BEFORE_SWAP` Hook address, deploys `AIRiskGuardHook`, and writes non-secret output to `deployments/xlayer-mainnet-latest.json`.

Then generate the copy-ready submission summary:

```bash
npm run submission:summary
```

## 3A. Deploy Demo Tokens If Needed

If you do not already have two ERC20 tokens for the demo pool, deploy the included demo pair:

```bash
npm run deploy:demo-tokens
```

This writes `deployments/xlayer-demo-tokens-latest.json`.

Set `TOKEN0` and `TOKEN1` from the sorted output:

```bash
export TOKEN0=replace_with_token0
export TOKEN1=replace_with_token1
```

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

Generate PoolManager `initialize` calldata:

```bash
npm run pool:init -- \
  "$XLAYER_MAINNET_POOL_MANAGER" \
  "$HOOK_ADDRESS" \
  "$TOKEN0" \
  "$TOKEN1" \
  60
```

Run the printed `castCommand`.

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

Regenerate the final copy-ready submission summary with public links and on-chain evidence:

```bash
npm run submission:finalize -- \
  --github "https://github.com/<your-user>/ai-risk-guard-hook" \
  --pool-id "$POOL_ID" \
  --pool-init-tx "$POOL_INIT_TX" \
  --policy-tx "$POLICY_TX" \
  --verify "$CONTRACT_VERIFICATION_URL" \
  --demo "$DEMO_VIDEO_URL" \
  --x "$X_ANNOUNCEMENT_URL"
```

This writes `deployments/submission-summary.md`.

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

Fill the table in `SUBMISSION.md` and the placeholders in `docs/okx-form.md` before submitting.

If the repository is not public yet, follow `docs/github-publish.md` before filling the form.
