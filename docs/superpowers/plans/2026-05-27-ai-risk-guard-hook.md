# AI Risk Guard Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a demo-ready Uniswap v4 Hook project for X Layer that enforces AI-authored swap risk policies.

**Architecture:** Use a Foundry Solidity package with npm-installed Uniswap v4 dependencies, plus a lightweight Vite React demo. The Hook implements `beforeSwap` and returns v4 dynamic LP fee overrides or reverts based on stored policy.

**Tech Stack:** Solidity 0.8.26, Foundry, Uniswap v4 core/periphery npm packages, Vite, React, TypeScript.

---

### Task 1: Project Baseline

**Files:**
- Create: `foundry.toml`
- Create: `remappings.txt`
- Modify: `package.json`
- Create: `.gitignore`

- [x] Configure Foundry to compile Solidity from `src`, tests from `test`, and dependencies from `node_modules`.
- [x] Add npm scripts for contract tests, app dev, and app build.
- [x] Ignore build artifacts and dependency folders.

### Task 2: Hook Contract

**Files:**
- Create: `src/AIRiskGuardHook.sol`

- [x] Implement policy storage keyed by Uniswap v4 `PoolId`.
- [x] Implement owner/operator controls for policy and risk mode updates.
- [x] Implement `getHookPermissions()` with `beforeSwap` enabled.
- [x] Implement `_beforeSwap()` to reject missing policy, exact-output swaps, blocked mode, and oversized swaps.
- [x] Return `LPFeeLibrary.OVERRIDE_FEE_FLAG` plus the configured fee for normal/elevated risk.

### Task 3: Hook Tests

**Files:**
- Create: `test/AIRiskGuardHook.t.sol`

- [x] Add a harness that skips hook address validation for local tests.
- [x] Test permissions and policy updates.
- [x] Test normal and elevated dynamic fee returns.
- [x] Test missing policy, exact-output, oversized swap, and blocked mode reverts.

### Task 4: Deployment Sketch

**Files:**
- Create: `script/DeployAIRiskGuardHook.s.sol`

- [x] Add an X Layer testnet deployment script skeleton.
- [x] Document that production deployment should mine a v4-valid hook address.

### Task 5: Demo UI

**Files:**
- Create: `app/package.json`
- Create: `app/index.html`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/src/styles.css`

- [x] Build a single-screen product demo, not a landing page.
- [x] Show natural-language AI policy input, compiled policy, risk mode, and Hook decision preview.
- [x] Keep visuals focused on the actual product workflow.

### Task 6: Submission Docs

**Files:**
- Create: `README.md`

- [x] Explain the product, Hook behavior, X Layer deployment target, commands, and hackathon submission checklist.
- [x] Include a short demo video script.

### Task 7: Verification

**Commands:**
- [ ] Run `forge test`.
- [ ] Run `npm --prefix app install`.
- [ ] Run `npm --prefix app run build`.
- [ ] Start the app locally and inspect it in browser.
