# Demo Video Script

Target length: 90-120 seconds.

## Setup

Open two terminal tabs and one browser:

```bash
npm run app:dev
forge test
```

Open the Vite local URL printed by the dev server.

## 0:00-0:10 - Problem

Say:

> Uniswap v4 Hooks are powerful, but most wallet users cannot express risk preferences as Hook code. AI Risk Guard Hook turns a normal-language risk instruction into an enforceable Uniswap v4 `beforeSwap` policy.

Show the app title and the AI Policy Compiler.

## 0:10-0:30 - AI Policy Authoring

Type or select:

> Keep swaps small and raise fees when volatility spikes.

Say:

> The AI layer compiles the prompt into bounded on-chain parameters: max exact input, normal fee, elevated fee, and a policy hash. The AI is not trusted on-chain; Solidity enforces the output policy.

Show the On-chain Parameters panel.

## 0:30-0:55 - Normal and Elevated Modes

Set Risk mode to Normal and keep swap input under the limit.

Say:

> In Normal mode, `beforeSwap` allows the swap and returns the normal dynamic LP fee.

Switch to Elevated.

Say:

> In Elevated mode, the same swap is allowed, but the Hook returns a higher dynamic LP fee override.

## 0:55-1:15 - Rejections and Circuit Breaker

Move the swap input above the limit.

Say:

> If the exact-input amount is above the policy limit, `beforeSwap` reverts.

Switch to Blocked.

Say:

> In Blocked mode, the Hook becomes a circuit breaker and rejects all swaps for the protected pool.

## 1:15-1:35 - Contract Proof

Show terminal:

```bash
forge test
```

Say:

> The Hook uses real Uniswap v4 core and periphery imports. Tests cover policy setup, normal and elevated dynamic fees, oversized swap rejection, missing policy rejection, blocked mode, and CREATE2 mining for a valid `BEFORE_SWAP` Hook address.

## 1:35-1:50 - Deployment Plan

Show `docs/deployment.md`.

Say:

> The deployment runbook targets X Layer mainnet with the official Uniswap v4 PoolManager. It deploys a CREATE2 factory, mines a valid Hook address, deploys the Hook, initializes a dynamic-fee pool, and configures the first policy.

## 1:50-2:00 - Close

Say:

> AI writes the policy. Solidity enforces it. This makes Uniswap v4 Hooks understandable and usable for ordinary wallet users on X Layer.
