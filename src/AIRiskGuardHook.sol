// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

/// @title AI Risk Guard Hook
/// @notice Enforces AI-authored swap risk policies for Uniswap v4 pools.
contract AIRiskGuardHook is BaseHook {
    using PoolIdLibrary for PoolKey;
    using LPFeeLibrary for uint24;

    enum RiskMode {
        Normal,
        Elevated,
        Blocked
    }

    struct Policy {
        bool enabled;
        uint128 maxExactInputAmount;
        uint24 normalFee;
        uint24 elevatedFee;
        RiskMode riskMode;
        bytes32 aiPolicyHash;
    }

    error NotOwner();
    error NotOperator();
    error PolicyDisabled(PoolId poolId);
    error ExactOutputDisabled(PoolId poolId);
    error SwapAmountTooLarge(PoolId poolId, uint256 amount, uint256 maxAmount);
    error PoolBlocked(PoolId poolId);
    error InvalidFee(uint24 fee);

    event OperatorUpdated(address indexed operator, bool allowed);
    event PolicyUpdated(
        PoolId indexed poolId,
        uint128 maxExactInputAmount,
        uint24 normalFee,
        uint24 elevatedFee,
        RiskMode riskMode,
        bytes32 aiPolicyHash
    );
    event RiskModeUpdated(PoolId indexed poolId, RiskMode riskMode);

    address public immutable owner;
    mapping(address operator => bool allowed) public operators;
    mapping(PoolId poolId => Policy policy) public policies;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyOperator() {
        if (msg.sender != owner && !operators[msg.sender]) revert NotOperator();
        _;
    }

    constructor(IPoolManager manager, address initialOwner) BaseHook(manager) {
        owner = initialOwner == address(0) ? msg.sender : initialOwner;
    }

    function setOperator(address operator, bool allowed) external onlyOwner {
        operators[operator] = allowed;
        emit OperatorUpdated(operator, allowed);
    }

    function setPolicy(
        PoolKey calldata key,
        uint128 maxExactInputAmount,
        uint24 normalFee,
        uint24 elevatedFee,
        RiskMode riskMode,
        bytes32 aiPolicyHash
    ) external onlyOperator {
        _validateFee(normalFee);
        _validateFee(elevatedFee);

        PoolId poolId = key.toId();
        policies[poolId] = Policy({
            enabled: true,
            maxExactInputAmount: maxExactInputAmount,
            normalFee: normalFee,
            elevatedFee: elevatedFee,
            riskMode: riskMode,
            aiPolicyHash: aiPolicyHash
        });

        emit PolicyUpdated(poolId, maxExactInputAmount, normalFee, elevatedFee, riskMode, aiPolicyHash);
    }

    function setRiskMode(PoolKey calldata key, RiskMode riskMode) external onlyOperator {
        PoolId poolId = key.toId();
        Policy storage policy = policies[poolId];
        if (!policy.enabled) revert PolicyDisabled(poolId);

        policy.riskMode = riskMode;
        emit RiskModeUpdated(poolId, riskMode);
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function _beforeSwap(address, PoolKey calldata key, SwapParams calldata params, bytes calldata)
        internal
        view
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        PoolId poolId = key.toId();
        Policy memory policy = policies[poolId];
        if (!policy.enabled) revert PolicyDisabled(poolId);
        if (params.amountSpecified > 0) revert ExactOutputDisabled(poolId);
        if (policy.riskMode == RiskMode.Blocked) revert PoolBlocked(poolId);

        uint256 exactInputAmount = uint256(-params.amountSpecified);
        if (exactInputAmount > policy.maxExactInputAmount) {
            revert SwapAmountTooLarge(poolId, exactInputAmount, policy.maxExactInputAmount);
        }

        uint24 fee = policy.riskMode == RiskMode.Elevated ? policy.elevatedFee : policy.normalFee;
        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, fee | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    function _validateFee(uint24 fee) internal pure {
        if (!fee.isValid()) revert InvalidFee(fee);
    }
}
