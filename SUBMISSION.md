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
npm run operator:next
npm run app:build
npm run deploy:demo-tokens -- --dry-run --skip-build
npm run mine:hook -- 0x1111111111111111111111111111111111111111 0x360e68faccca8ca495c1b759fd9eee466db9fb32 0x2222222222222222222222222222222222222222
npm run pool:init -- 0x360e68faccca8ca495c1b759fd9eee466db9fb32 0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080 0x0000000000000000000000000000000000001000 0x0000000000000000000000000000000000002000 60
npm run policy:calldata -- 0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080 0x0000000000000000000000000000000000001000 0x0000000000000000000000000000000000002000 60 1000000000 500 3000 0 "Keep swaps small and raise fees when volatility spikes."
npm run submission:links -- --deployment deployments/mock/deployment.json --tokens deployments/mock/tokens.json --pool deployments/mock/pool.json
npm run submission:public -- --deployment deployments/mock/deployment.json --tokens deployments/mock/tokens.json --pool deployments/mock/pool.json --github https://github.com/example/ai-risk-guard-hook --verify https://www.oklink.com/xlayer/address/0xabdE3870CD4a1CE8Bb761963b2080e21AC9d8080 --demo https://youtu.be/demo --x https://x.com/example/status/1 --out deployments/mock/PUBLIC_SUBMISSION.md
npm run submission:social -- --deployment deployments/mock/deployment.json --pool deployments/mock/pool.json --github https://github.com/example/ai-risk-guard-hook --demo https://youtu.be/demo --public https://github.com/example/ai-risk-guard-hook/blob/main/PUBLIC_SUBMISSION.md
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

## Live Deployment Evidence

| Item | Value |
| --- | --- |
| HookDeployer address | `0xea4f7588b9db4e351ccab2be51dabc84d95332fd` |
| HookDeployer tx | `0x8e0f48ef553671a1cc5d8655131a80bd3d9de575596b8c9145a50c45a61f04a3` |
| AI Risk Guard Hook address | `0x85Ec46D496523aAd8BbDB6E5c4A8c36d6621C080` |
| Hook deployment tx | `0x803ca69daee3bfea564247f88566268c4474ee29fd3b7a46446d7ba33b59fc39` |
| Token0 | `0x5166819f807e0F9936855f68dfDDFfb3acaF7c00` |
| Token0 deployment tx | `0xc284796b921e351d474219a0ad88b898e1436c8ce6d66894f4d66a1b5a307465` |
| Token1 | `0xDa6004321845A8eF2130286063031B4b5DaBBA92` |
| Token1 deployment tx | `0x34a5394f7ffeb6930cc3b2702e6f14422df33652db9a4aa65318724e69c85acc` |
| PoolId | `0x20782b73d3694279664b30e7fed2de6eb0d2d865fc523bd18f3c9f5a487caa83` |
| Pool initialization tx | `0x804fad616c475c54b2e5b580cae06fbc722c43fe27d0b7a6ec618ef4373e07f7` |
| Policy configuration tx | `0x3aeec5491e3fd381955c2143b49610ef5198d5aa9ea70939bbd7263899709e2d` |
| Contract verification URL | `https://www.oklink.com/xlayer/address/0x85Ec46D496523aAd8BbDB6E5c4A8c36d6621C080` |
| Demo video URL | `fill_after_video_upload` |
| X announcement URL | `fill_after_x_post` |

## Suggested X Post

AI Risk Guard Hook is my @XLayerOfficial Hook the Future submission.

It turns plain-language risk preferences into a Uniswap v4 `beforeSwap` Hook policy: max swap size, dynamic risk fees, and circuit breaker mode.

AI writes the policy. Solidity enforces it.

Built on X Layer with Uniswap v4 Hooks.

@Uniswap @flapdotsh

## Final Submit Checklist

- [ ] Push repository to a public GitHub repo.
- [x] Deploy `HookDeployer`.
- [x] Mine a `BEFORE_SWAP` Hook address.
- [x] Deploy `AIRiskGuardHook`.
- [x] Create or initialize a dynamic-fee v4 pool using the Hook.
- [x] Configure the first pool policy.
- [x] Verify contracts on OKLink or the relevant X Layer explorer.
- [ ] Record demo video.
- [ ] Publish X announcement from the dedicated project/account.
- [ ] Submit the repository, addresses, demo video, and X link on the OKX event page before `2026-05-28 23:59 UTC`.
