// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AIRiskGuardHook} from "../src/AIRiskGuardHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

/// @notice X Layer testnet deployment sketch.
/// @dev For a real v4 pool, mine a CREATE2 salt so the deployed hook address has
/// the BEFORE_SWAP flag expected by Uniswap v4 Hooks.validateHookPermissions.
contract DeployAIRiskGuardHook {
    address internal constant XLAYER_TESTNET_POOL_MANAGER_PLACEHOLDER = address(0);

    function deploy(address poolManager, address owner) external returns (AIRiskGuardHook hook) {
        require(poolManager != XLAYER_TESTNET_POOL_MANAGER_PLACEHOLDER, "set X Layer PoolManager");
        hook = new AIRiskGuardHook(IPoolManager(poolManager), owner);
    }
}
