# AI Risk Guard Hook

AI Risk Guard Hook is an OKX Hook the Future hackathon project for X Layer. It turns a plain-language risk preference into a Uniswap v4 `beforeSwap` Hook policy that can reject unsafe swaps or return a dynamic LP fee override.

## Why It Exists

Most retail users cannot reason about Uniswap v4 Hooks, dynamic fees, volatility, and circuit breakers. This project makes the Hook feel like a product:

1. A user describes a risk preference in normal language.
2. The app compiles that preference into bounded policy parameters.
3. The operator writes the policy to the Hook for a v4 pool.
4. Uniswap v4 calls `beforeSwap`.
5. The Hook allows, rejects, or raises fees based on the policy.

AI proposes the policy. Solidity enforces it.

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

## Demo Script

1. Show the app and type: "Keep swaps small and raise fees when volatility spikes."
2. Point to the compiled policy: max exact input, normal fee, elevated fee, policy hash.
3. Move the swap slider below the max. The Hook preview returns "Allowed."
4. Switch to elevated risk. The Hook preview still allows the swap but returns a higher dynamic fee.
5. Move the swap above the max. The Hook preview rejects the swap.
6. Switch to blocked risk. The Hook preview shows the circuit breaker.
7. Show `forge test` passing against the real Uniswap v4 Hook imports.

## Hackathon Checklist

- Deploy a Uniswap v4 Pool and Hook on X Layer mainnet or testnet.
- Verify the Hook contract address.
- Record a short demo video.
- Submit the repository, demo, and contract addresses through the OKX event page.
- Announce the project from a dedicated X account and tag `@XLayerOfficial`, `@Uniswap`, and `@flapdotsh`.

## Current Status

- Core Hook contract implemented.
- Foundry tests cover the policy engine.
- Demo app implemented.
- Deployment runbook, CREATE2 factory, and Hook salt miner implemented.
- Live deployment still requires a funded X Layer deployer wallet and contract verification.
