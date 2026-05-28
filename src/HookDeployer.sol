// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AIRiskGuardHook} from "./AIRiskGuardHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

/// @title Hook Deployer
/// @notice Minimal CREATE2 factory for deploying AIRiskGuardHook at a v4-valid address.
contract HookDeployer {
    event HookDeployed(address indexed hook, bytes32 indexed salt, address indexed poolManager, address owner);

    function deployAIRiskGuardHook(bytes32 salt, IPoolManager poolManager, address owner)
        external
        returns (AIRiskGuardHook hook)
    {
        hook = new AIRiskGuardHook{salt: salt}(poolManager, owner);
        emit HookDeployed(address(hook), salt, address(poolManager), owner);
    }
}
