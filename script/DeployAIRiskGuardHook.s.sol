// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AIRiskGuardHook} from "../src/AIRiskGuardHook.sol";
import {HookDeployer} from "../src/HookDeployer.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

/// @notice Reference deployment wrapper for X Layer.
/// @dev This file is intentionally forge-std-free so the repo can compile without
/// git submodules. Use HookDeployer plus scripts/mine-hook-address.mjs in practice.
contract DeployAIRiskGuardHook {
    address internal constant XLAYER_MAINNET_POOL_MANAGER = 0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32;

    function deployFactory() external returns (HookDeployer deployer) {
        deployer = new HookDeployer();
    }

    function deployHook(HookDeployer deployer, bytes32 salt, address owner) external returns (AIRiskGuardHook hook) {
        hook = deployer.deployAIRiskGuardHook(salt, IPoolManager(XLAYER_MAINNET_POOL_MANAGER), owner);
    }
}
