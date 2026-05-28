# OKX Form Copy Pack

Use this file when filling the OKX Hook the Future submission form. Live deployment is complete; replace only the GitHub, demo video, and X announcement placeholders after publishing.

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
HookDeployer address: 0xea4f7588b9db4e351ccab2be51dabc84d95332fd
HookDeployer tx: 0x8e0f48ef553671a1cc5d8655131a80bd3d9de575596b8c9145a50c45a61f04a3
AI Risk Guard Hook address: 0x85Ec46D496523aAd8BbDB6E5c4A8c36d6621C080
Hook deployment tx: 0x803ca69daee3bfea564247f88566268c4474ee29fd3b7a46446d7ba33b59fc39
Token0: 0x5166819f807e0F9936855f68dfDDFfb3acaF7c00
Token0 deployment tx: 0xc284796b921e351d474219a0ad88b898e1436c8ce6d66894f4d66a1b5a307465
Token1: 0xDa6004321845A8eF2130286063031B4b5DaBBA92
Token1 deployment tx: 0x34a5394f7ffeb6930cc3b2702e6f14422df33652db9a4aa65318724e69c85acc
PoolId: 0x20782b73d3694279664b30e7fed2de6eb0d2d865fc523bd18f3c9f5a487caa83
Pool initialization tx: 0x804fad616c475c54b2e5b580cae06fbc722c43fe27d0b7a6ec618ef4373e07f7
Policy configuration tx: 0x3aeec5491e3fd381955c2143b49610ef5198d5aa9ea70939bbd7263899709e2d
Contract verification URL: https://www.oklink.com/xlayer/address/0x85Ec46D496523aAd8BbDB6E5c4A8c36d6621C080
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

## Suggested OKX Wallet Feedback

```text
@OKXWallet_CN 给活动页提一个小建议：能不能加一个“一键复制 Markdown”按钮？

把活动规则、提交要求、截止时间、官方链接和标签要求整理成 Markdown，普通参赛者就可以直接粘给 Claude Code / Codex / ChatGPT 做头脑风暴、拆需求、生成提交清单。

现在黑客松越来越像“想法 + AI 执行力”的比赛，活动信息越适合 AI 读取，普通人越容易参赛。
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
