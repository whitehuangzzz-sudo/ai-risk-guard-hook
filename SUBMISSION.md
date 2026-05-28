# OKX Hook the Future Submission Pack

## Project

**Name:** AI Risk Guard Hook

**One-liner:** An AI-assisted Uniswap v4 Hook that turns plain-language retail risk preferences into on-chain swap limits, dynamic fees, and circuit breakers.

**Track fit:** Hook the Future / Uniswap v4 Hooks on X Layer.

## Short Description

AI Risk Guard Hook lets a user describe how cautious they want a pool to be. The app compiles that prompt into bounded parameters such as max exact-input size, normal fee, elevated-risk fee, and blocked mode. The Uniswap v4 `beforeSwap` Hook enforces those parameters on-chain for a protected dynamic-fee pool.

AI does not make privileged on-chain decisions. AI helps author the policy; Solidity enforces the policy.

## Problem

Uniswap v4 Hooks are powerful, but ordinary wallet users do not think in terms of `PoolKey`, dynamic LP fee flags, risk modes, or circuit breakers. That makes many Hook ideas feel like infrastructure demos instead of user-facing products.

## Solution

AI Risk Guard Hook wraps Hook policy authoring in a retail-friendly flow:

1. User writes a simple risk instruction.
2. The app compiles it into explicit policy parameters.
3. The operator sets that policy for a Uniswap v4 pool.
4. During swaps, `beforeSwap` allows, rejects, or raises fees.

## What the Hook Does

- Rejects swaps for pools without a configured policy.
- Rejects exact-output swaps in v1 for clearer retail risk limits.
- Rejects exact-input swaps above the configured max amount.
- Returns normal dynamic LP fee in Normal mode.
- Returns elevated dynamic LP fee in Elevated mode.
- Reverts all swaps in Blocked mode.

## X Layer / Uniswap v4 Details

- Target chain: X Layer mainnet, chain id `196`.
- Uniswap v4 PoolManager on X Layer: `0x360e68faccca8ca495c1b759fd9eee466db9fb32`.
- Hook permission: `BEFORE_SWAP`.
- Dynamic-fee pool required: `fee = 0x800000`.

## Repository Evidence

- Hook contract: `src/AIRiskGuardHook.sol`
- Demo token contract: `src/DemoERC20.sol`
- CREATE2 factory: `src/HookDeployer.sol`
- Demo token deployer: `scripts/deploy-demo-tokens.mjs`
- Hook address miner: `scripts/mine-hook-address.mjs`
- Policy calldata encoder: `scripts/encode-policy-calldata.mjs`
- Pool initialization calldata encoder: `scripts/encode-pool-init-calldata.mjs`
- Local deployment automation: `scripts/deploy-xlayer.mjs`
- Wallet/RPC preflight: `scripts/wallet-check.mjs`
- Submission summary/final form generator: `scripts/submission-summary.mjs`
- Tests: `test/AIRiskGuardHook.t.sol`
- Demo app: `app/src/App.tsx`
- Deployment runbook: `docs/deployment.md`
- Operator checklist: `docs/operator-checklist.md`
- GitHub publish checklist: `docs/github-publish.md`
- OKX form copy pack: `docs/okx-form.md`
- Demo screenshot: `docs/assets/demo-screenshot.png`

## Verification Commands

```bash
forge test
npm run verify
npm run app:build
npm run deploy:demo-tokens -- --dry-run --skip-build
npm run mine:hook -- 0x1111111111111111111111111111111111111111 0x360e68faccca8ca495c1b759fd9eee466db9fb32 0x2222222222222222222222222222222222222222
npm run pool:init -- 0x360e68faccca8ca495c1b759fd9eee466db9fb32 0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080 0x0000000000000000000000000000000000001000 0x0000000000000000000000000000000000002000 60
npm run policy:calldata -- 0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080 0x0000000000000000000000000000000000001000 0x0000000000000000000000000000000000002000 60 1000000000 500 3000 0 "Keep swaps small and raise fees when volatility spikes."
npm run submission:check -- --github "$GITHUB_URL" --verify "$CONTRACT_VERIFICATION_URL" --demo "$DEMO_VIDEO_URL" --x "$X_ANNOUNCEMENT_URL"
npm audit --audit-level=moderate
```

Expected current result:

- `forge test`: 9 passed, 0 failed.
- `npm run verify`: runs contract tests, app build, Hook mining, policy calldata, and npm audit.
- `npm run app:build`: Vite production build succeeds.
- `npm run mine:hook`: returns a `BEFORE_SWAP` Hook address, salt, and deploy calldata.
- `npm run pool:init`: returns PoolId and PoolManager `initialize` calldata.
- `npm run policy:calldata`: returns PoolId, policy hash, and `setPolicy` calldata.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.

## Deployment Evidence To Fill

Fill these after live deployment:

| Item | Value |
| --- | --- |
| HookDeployer address | |
| HookDeployer tx | |
| AI Risk Guard Hook address | |
| Hook deployment tx | |
| Token0 | |
| Token0 deployment tx | |
| Token1 | |
| Token1 deployment tx | |
| Pool address / PoolId | |
| Pool initialization tx | |
| Policy configuration tx | |
| Contract verification URL | |
| Demo video URL | |
| X announcement URL | |

## Suggested X Post

AI Risk Guard Hook is my @XLayerOfficial Hook the Future submission.

It turns plain-language risk preferences into a Uniswap v4 `beforeSwap` Hook policy: max swap size, dynamic risk fees, and circuit breaker mode.

AI writes the policy. Solidity enforces it.

Built on X Layer with Uniswap v4 Hooks.

@Uniswap @flapdotsh

## Final Submit Checklist

- [ ] Push repository to a public GitHub repo.
- [ ] Deploy `HookDeployer`.
- [ ] Mine a `BEFORE_SWAP` Hook address.
- [ ] Deploy `AIRiskGuardHook`.
- [ ] Create or initialize a dynamic-fee v4 pool using the Hook.
- [ ] Configure the first pool policy.
- [ ] Verify contracts on OKLink or the relevant X Layer explorer.
- [ ] Record demo video.
- [ ] Publish X announcement from the dedicated project/account.
- [ ] Submit the repository, addresses, demo video, and X link on the OKX event page before `2026-05-28 23:59 UTC`.
