# AI Risk Guard Hook Public Submission

AI Risk Guard Hook is an OKX Hook the Future submission for X Layer. It turns plain-language retail risk preferences into an enforceable Uniswap v4 `beforeSwap` policy with swap limits, dynamic LP fee overrides, and circuit-breaker mode.

AI helps author the policy. Solidity enforces it.

## On-Chain Evidence

| Item | Value |
| --- | --- |
| Chain | X Layer mainnet (196) |
| PoolManager | [0x360e68faccca8ca495c1b759fd9eee466db9fb32](https://www.oklink.com/xlayer/address/0x360e68faccca8ca495c1b759fd9eee466db9fb32) |
| HookDeployer | [0xea4f7588b9db4e351ccab2be51dabc84d95332fd](https://www.oklink.com/xlayer/address/0xea4f7588b9db4e351ccab2be51dabc84d95332fd) |
| HookDeployer tx | [0x8e0f48ef553671a1cc5d8655131a80bd3d9de575596b8c9145a50c45a61f04a3](https://www.oklink.com/xlayer/tx/0x8e0f48ef553671a1cc5d8655131a80bd3d9de575596b8c9145a50c45a61f04a3) |
| AI Risk Guard Hook | [0x85Ec46D496523aAd8BbDB6E5c4A8c36d6621C080](https://www.oklink.com/xlayer/address/0x85Ec46D496523aAd8BbDB6E5c4A8c36d6621C080) |
| Hook deployment tx | [0x803ca69daee3bfea564247f88566268c4474ee29fd3b7a46446d7ba33b59fc39](https://www.oklink.com/xlayer/tx/0x803ca69daee3bfea564247f88566268c4474ee29fd3b7a46446d7ba33b59fc39) |
| Token0 | [0x5166819f807e0F9936855f68dfDDFfb3acaF7c00](https://www.oklink.com/xlayer/address/0x5166819f807e0F9936855f68dfDDFfb3acaF7c00) |
| Token0 deployment tx | [0xc284796b921e351d474219a0ad88b898e1436c8ce6d66894f4d66a1b5a307465](https://www.oklink.com/xlayer/tx/0xc284796b921e351d474219a0ad88b898e1436c8ce6d66894f4d66a1b5a307465) |
| Token1 | [0xDa6004321845A8eF2130286063031B4b5DaBBA92](https://www.oklink.com/xlayer/address/0xDa6004321845A8eF2130286063031B4b5DaBBA92) |
| Token1 deployment tx | [0x34a5394f7ffeb6930cc3b2702e6f14422df33652db9a4aa65318724e69c85acc](https://www.oklink.com/xlayer/tx/0x34a5394f7ffeb6930cc3b2702e6f14422df33652db9a4aa65318724e69c85acc) |
| PoolId | `0x20782b73d3694279664b30e7fed2de6eb0d2d865fc523bd18f3c9f5a487caa83` |
| Pool initialization tx | [0x804fad616c475c54b2e5b580cae06fbc722c43fe27d0b7a6ec618ef4373e07f7](https://www.oklink.com/xlayer/tx/0x804fad616c475c54b2e5b580cae06fbc722c43fe27d0b7a6ec618ef4373e07f7) |
| Policy configuration tx | [0x3aeec5491e3fd381955c2143b49610ef5198d5aa9ea70939bbd7263899709e2d](https://www.oklink.com/xlayer/tx/0x3aeec5491e3fd381955c2143b49610ef5198d5aa9ea70939bbd7263899709e2d) |
| Contract verification | [https://www.oklink.com/xlayer/address/0x85Ec46D496523aAd8BbDB6E5c4A8c36d6621C080](https://www.oklink.com/xlayer/address/0x85Ec46D496523aAd8BbDB6E5c4A8c36d6621C080) |
| GitHub repository | [https://github.com/whitehuangzzz-sudo/ai-risk-guard-hook](https://github.com/whitehuangzzz-sudo/ai-risk-guard-hook) |
| Demo video | [https://youtu.be/zwHA7-ogx-Q](https://youtu.be/zwHA7-ogx-Q) |
| X announcement | [https://x.com/Whitehhh7/status/2059989800145523169](https://x.com/Whitehhh7/status/2059989800145523169) |

## Verification

```bash
npm install
npm --prefix app install
npm run verify
```

Expected result: `Local verification passed.`

## Repository Pointers

- Hook contract: `src/AIRiskGuardHook.sol`
- CREATE2 factory: `src/HookDeployer.sol`
- Demo token contract: `src/DemoERC20.sol`
- Demo app: `app/`
- Operator runbook: `docs/operator-checklist.md`
- OKX form copy pack: `docs/okx-form.md`

