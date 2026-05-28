# AI Risk Guard Hook

AI Risk Guard Hook is an OKX Hook the Future hackathon project for X Layer. It turns a plain-language risk preference into a Uniswap v4 `beforeSwap` Hook policy that can reject unsafe swaps, return dynamic LP fee overrides, and trigger circuit-breaker mode.

**AI writes the policy. Solidity enforces it.**

![AI Risk Guard Hook demo](docs/assets/demo-screenshot.png)

## Status

| Area | Status |
| --- | --- |
| Hook contract | Implemented in `src/AIRiskGuardHook.sol` |
| Demo ERC20 pair | Implemented in `src/DemoERC20.sol` and `scripts/deploy-demo-tokens.mjs` |
| CREATE2 deployment | Implemented in `src/HookDeployer.sol` and `scripts/deploy-xlayer.mjs` |
| Tests | `9 passed, 0 failed` with real Uniswap v4 imports |
| Demo app | Implemented in `app/` |
| Submission docs | `SUBMISSION.md`, `docs/okx-form.md`, `docs/operator-checklist.md`, `docs/demo-video-script.md` |
| Live deployment | Requires funded X Layer wallet and final Pool/Hook addresses |

## Quick Start

```bash
npm install
npm --prefix app install
npm run verify
npm run app:dev
```

## Table of Contents

- [Why It Exists](#why-it-exists)
- [How It Works](#how-it-works)
- [Hook Behavior](#hook-behavior)
- [X Layer Target](#x-layer-target)
- [Commands](#commands)
- [Submission Flow](#submission-flow)
- [Current Status](#current-status)

## Why It Exists

Most retail users cannot reason about Uniswap v4 Hooks, dynamic fees, volatility, and circuit breakers. This project makes the Hook feel like a product:

1. A user describes a risk preference in normal language.
2. The app compiles that preference into bounded policy parameters.
3. The operator writes the policy to the Hook for a v4 pool.
4. Uniswap v4 calls `beforeSwap`.
5. The Hook allows, rejects, or raises fees based on the policy.

AI proposes the policy. Solidity enforces it.

## How It Works

```mermaid
flowchart LR
    User["Retail user prompt"] --> App["AI Policy Compiler UI"]
    App --> Policy["Bounded policy params"]
    Policy --> Hook["AIRiskGuardHook beforeSwap"]
    Hook --> Allow["Allow swap + normal fee"]
    Hook --> Elevated["Allow swap + elevated fee"]
    Hook --> Block["Revert swap"]
    Hook --> Deploy["X Layer Uniswap v4 dynamic-fee pool"]
```

The AI layer is a policy authoring assistant. It does not have privileged on-chain authority. The Hook stores explicit policy parameters and enforces them deterministically inside `beforeSwap`.

## Hook Behavior

`src/AIRiskGuardHook.sol` implements:

- per-pool policy storage keyed by Uniswap v4 `PoolId`;
- exact-input max swap limits;
- normal and elevated dynamic LP fee overrides;
- blocked-mode circuit breaker;
- owner/operator controls for hackathon demo operations.

The first version intentionally rejects exact-output swaps so the demo risk model stays clear.

## X Layer Target

The project is intended for X Layer deployment. Uniswap's official v4 deployments list includes X Layer mainnet, chain id `196`.

- X Layer mainnet chain id: `196`
- X Layer mainnet PoolManager: `0x360e68faccca8ca495c1b759fd9eee466db9fb32`
- X Layer testnet chain id: `1952`
- Testnet RPC: `https://testrpc.xlayer.tech/terigon`

For deployment details, see `docs/deployment.md`. The repo includes a `HookDeployer` CREATE2 factory and a salt miner so the Hook address has the `BEFORE_SWAP` permission bit required by Uniswap v4.

## Commands

Install dependencies:

```bash
npm install
npm --prefix app install
```

Run Solidity tests:

```bash
forge test
```

Run the full local verification suite:

```bash
npm run verify
```

Show the next live-operator command:

```bash
npm run operator:next
```

Run the demo app:

```bash
npm run app:dev
```

Build the demo app:

```bash
npm run app:build
```

Mine a v4-valid Hook address after deploying `HookDeployer`:

```bash
npm run mine:hook -- "$HOOK_DEPLOYER_ADDRESS" "$XLAYER_MAINNET_POOL_MANAGER" "$OWNER_ADDRESS"
```

Initialize the demo pool and configure its first policy after deploying demo tokens and Hook:

```bash
npm run pool:configure
```

Generate `setPolicy` and `setRiskMode` calldata:

```bash
npm run pool:init -- "$XLAYER_MAINNET_POOL_MANAGER" "$HOOK_ADDRESS" "$TOKEN0" "$TOKEN1" 60
npm run policy:calldata -- "$HOOK_ADDRESS" "$TOKEN0" "$TOKEN1" 60 1000000000 500 3000 0 "Keep swaps small and raise fees when volatility spikes."
```

Deploy the Hook stack from a local wallet environment:

```bash
npm run wallet:check
npm run deploy:demo-tokens
npm run deploy:xlayer
```

Generate a copy-ready submission summary after deployment:

```bash
npm run submission:summary
npm run submission:finalize -- --github "$GITHUB_URL" --pool-id "$POOL_ID" --pool-init-tx "$POOL_INIT_TX" --policy-tx "$POLICY_TX" --verify "$VERIFY_URL" --demo "$DEMO_URL" --x "$X_URL"
```

## Submission Flow

1. Publish the repo with `docs/github-publish.md`.
2. Fill `.env` locally; never commit it.
3. Run `npm run wallet:check`.
4. Run `npm run deploy:demo-tokens` if you do not already have a token pair for the demo pool.
5. Run `npm run deploy:xlayer`.
6. Run `npm run pool:configure` to initialize the dynamic-fee v4 pool and configure the first policy.
7. Optionally run `npm run pool:init` and `npm run policy:calldata` if you prefer manual calldata submission.
8. Record the demo using `docs/demo-video-script.md`.
9. Fill `SUBMISSION.md` and `docs/okx-form.md`, publish the X post, and submit the OKX form.

## Demo Script

See `docs/demo-video-script.md` for a 90-120 second recording script.

## Hackathon Checklist

- Deploy a Uniswap v4 Pool and Hook on X Layer mainnet or testnet.
- Verify the Hook contract address.
- Record a short demo video.
- Submit the repository, demo, and contract addresses through the OKX event page.
- Announce the project from a dedicated X account and tag `@XLayerOfficial`, `@Uniswap`, and `@flapdotsh`.

See `SUBMISSION.md` for the final submission pack, suggested X post, and address table.

Use `docs/okx-form.md` for copy-ready OKX form fields.

If the deployer wallet is ready, follow `docs/operator-checklist.md`.

For GitHub publishing, follow `docs/github-publish.md`.

## Current Status

- Core Hook contract implemented.
- Foundry tests cover the policy engine.
- Demo app implemented.
- Deployment runbook, CREATE2 factory, and Hook salt miner implemented.
- Demo ERC20 deployment path implemented for self-contained pool creation.
- Live deployment still requires a funded X Layer deployer wallet and contract verification.
