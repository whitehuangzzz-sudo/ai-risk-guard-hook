# OKX Form Copy Pack

Use this file when filling the OKX Hook the Future submission form. Replace every `fill_after_*` value after live deployment and publishing.

## Project Name

```text
AI Risk Guard Hook
```

## One-Line Summary

```text
An AI-assisted Uniswap v4 beforeSwap Hook that turns plain-language retail risk preferences into on-chain swap limits, dynamic LP fee overrides, and circuit-breaker mode on X Layer.
```

## Project Description

```text
AI Risk Guard Hook makes Uniswap v4 Hooks usable for ordinary wallet users. A user describes a risk preference in normal language, and the demo compiles it into bounded policy parameters: max exact-input size, normal LP fee, elevated-risk LP fee, and risk mode. The on-chain AIRiskGuardHook enforces those parameters inside beforeSwap for a dynamic-fee Uniswap v4 pool on X Layer.

The AI layer is only a policy authoring assistant. It has no privileged on-chain authority. Solidity stores and enforces explicit policy values, rejects pools without configured policies, rejects oversized exact-input swaps, rejects exact-output swaps in v1, returns dynamic LP fee overrides in Normal or Elevated mode, and reverts all swaps in Blocked mode.
```

## Why It Matters

```text
Most retail users do not think in terms of PoolKey, dynamic fee flags, Hook permission bits, or circuit breakers. This project turns a complex Uniswap v4 Hook workflow into a product-like risk control experience while keeping enforcement deterministic and auditable on-chain.
```

## Technical Highlights

```text
- Uniswap v4 beforeSwap Hook with BEFORE_SWAP permission.
- Dynamic-fee pool support using fee = 0x800000.
- Per-pool policy storage keyed by PoolId.
- Normal, Elevated, and Blocked risk modes.
- CREATE2 HookDeployer plus salt miner for valid Hook permission bits.
- X Layer mainnet target with PoolManager 0x360e68faccca8ca495c1b759fd9eee466db9fb32.
- Local verification suite covering Solidity tests, app build, Hook address mining, policy calldata, pool initialization calldata, and npm audit.
- Demo app showing policy authoring, fee changes, swap rejection, and circuit breaker behavior.
```

## Links

```text
GitHub repository: fill_after_github_publish
Demo video: fill_after_video_upload
X announcement: fill_after_x_post
```

## On-Chain Evidence

```text
Network: X Layer mainnet, chain id 196
PoolManager: 0x360e68faccca8ca495c1b759fd9eee466db9fb32
HookDeployer address: fill_after_deploy
HookDeployer tx: fill_after_deploy
AI Risk Guard Hook address: fill_after_deploy
Hook deployment tx: fill_after_deploy
Token0: fill_after_token_selection
Token0 deployment tx: fill_after_token_deploy
Token1: fill_after_token_selection
Token1 deployment tx: fill_after_token_deploy
PoolId: fill_after_pool_initialize
Pool initialization tx: fill_after_pool_initialize
Policy configuration tx: fill_after_set_policy
Contract verification URL: fill_after_verify
```

## Verification Commands

```bash
npm install
npm --prefix app install
npm run verify
```

Expected result:

```text
Local verification passed.
```

## Suggested X Post

```text
AI Risk Guard Hook is my @XLayerOfficial Hook the Future submission.

It turns plain-language risk preferences into a Uniswap v4 beforeSwap Hook policy: max swap size, dynamic risk fees, and circuit breaker mode.

AI writes the policy. Solidity enforces it.

Built on X Layer with Uniswap v4 Hooks.

@Uniswap @flapdotsh
```

## Final Pre-Submit Check

- GitHub repo is public.
- `.env` and `deployments/` are not committed.
- Hook and Pool evidence are filled above.
- `npm run submission:links` generated `deployments/explorer-links.md`.
- `npm run submission:social` generated `deployments/social-posts.md`.
- `npm run submission:check` returns `"status": "ready"`.
- Demo video is viewable without permission problems.
- X post includes `@XLayerOfficial`, `@Uniswap`, and `@flapdotsh`.
- OKX form is submitted before `2026-05-28 23:59 UTC`.
