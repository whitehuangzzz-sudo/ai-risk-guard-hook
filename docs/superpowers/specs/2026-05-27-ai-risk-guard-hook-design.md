# AI Risk Guard Hook Design

## Goal

Build a demo-ready OKX Hook the Future submission for X Layer: an AI-assisted Uniswap v4 Hook that turns a plain-language trading risk profile into enforceable on-chain swap guardrails.

## Hackathon Fit

- The submission centers on a Uniswap v4 Hook, not a generic dashboard.
- The Hook is designed for X Layer deployment and includes X Layer testnet configuration.
- The demo shows a concrete user story: a retail user asks AI for a safer swap policy, then the Hook enforces that policy during pool swaps.
- The project keeps AI off-chain and verifiable: AI produces bounded parameters, while Solidity enforces them.

## Product Concept

AI Risk Guard Hook protects a Uniswap v4 pool with three simple controls:

1. **Per-swap notional limit**: reject exact-input swaps that exceed the configured amount.
2. **Volatility-aware dynamic fee**: return a higher LP fee when the pool is in elevated or critical risk mode.
3. **Circuit breaker**: block swaps when risk mode is set to blocked.

The demo frontend presents a simple "AI policy compiler" simulation. A user enters a sentence such as "I only want small swaps and higher fees when volatility spikes." The app maps it into on-chain policy parameters, displays the generated policy, and shows how the Hook would react to normal, elevated, and blocked risk modes.

## Architecture

The Solidity contract inherits from Uniswap v4 periphery `BaseHook` and implements `beforeSwap`. It stores a policy per `PoolId`, controlled by an owner/operator for hackathon demo purposes. In `beforeSwap`, it reads the pool policy, checks swap size and risk mode, and returns a dynamic fee override when appropriate.

The frontend is intentionally lightweight. It does not need a production wallet flow for the first demo; it should explain and simulate the product clearly, while the contracts and tests prove the core Hook behavior.

## Components

- `src/AIRiskGuardHook.sol`: Uniswap v4 Hook implementation.
- `test/AIRiskGuardHook.t.sol`: Foundry tests for policy enforcement, dynamic fee selection, and circuit breaker behavior.
- `script/DeployAIRiskGuardHook.s.sol`: Deployment sketch for X Layer testnet, including Hook address mining notes.
- `app/`: Vite React demo that converts natural-language strategy examples into policy previews.
- `README.md`: Hackathon narrative, setup, test, deploy, and submission checklist.

## Data Flow

1. User describes desired risk behavior in the demo UI.
2. UI maps the prompt to a policy preview: max swap amount, normal fee, elevated fee, blocked mode.
3. Operator submits that policy on-chain for a Uniswap v4 pool.
4. During swaps, Uniswap v4 calls `beforeSwap`.
5. The Hook rejects swaps that violate policy or returns a dynamic fee override.

## Error Handling

- Missing policy means "fail closed" for protected pools: swaps revert until a policy is configured.
- Exact-output swaps are rejected in the first version because notional limits are simpler and clearer for exact-input demos.
- Invalid fee values are rejected at policy update time.
- Blocked risk mode always reverts.

## Testing

Foundry tests cover:

- permission flags for `beforeSwap`;
- successful policy update;
- normal risk fee;
- elevated risk fee;
- swap amount limit rejection;
- blocked risk mode rejection;
- exact-output rejection.

## Scope Boundaries

This project does not claim a production-grade AI oracle. The AI layer is a policy authoring assistant; Solidity remains the source of enforcement. The first demo uses an operator-controlled risk mode, which can later be replaced by an oracle, keeper, or OKX wallet risk feed.
