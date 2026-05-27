// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AIRiskGuardHook} from "../src/AIRiskGuardHook.sol";
import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

contract AIRiskGuardHookHarness is AIRiskGuardHook {
    constructor(IPoolManager manager, address initialOwner) AIRiskGuardHook(manager, initialOwner) {}

    function validateHookAddress(BaseHook) internal pure override {}
}

contract AIRiskGuardHookTest {
    using PoolIdLibrary for PoolKey;

    AIRiskGuardHookHarness internal hook;
    PoolKey internal key;

    uint128 internal constant MAX_SWAP = 1_000 ether;
    uint24 internal constant NORMAL_FEE = 500;
    uint24 internal constant ELEVATED_FEE = 3_000;
    bytes32 internal constant POLICY_HASH = keccak256("small retail swaps; raise fees during volatility");

    function setUp() public {
        hook = new AIRiskGuardHookHarness(IPoolManager(address(this)), address(this));
        key = PoolKey({
            currency0: Currency.wrap(address(0x1000)),
            currency1: Currency.wrap(address(0x2000)),
            fee: LPFeeLibrary.DYNAMIC_FEE_FLAG,
            tickSpacing: 60,
            hooks: IHooks(address(hook))
        });
    }

    function testHookPermissionsEnableBeforeSwapOnly() public {
        Hooks.Permissions memory permissions = hook.getHookPermissions();

        assertTrue(permissions.beforeSwap);
        assertFalse(permissions.afterSwap);
        assertFalse(permissions.beforeInitialize);
        assertFalse(permissions.afterInitialize);
        assertFalse(permissions.beforeSwapReturnDelta);
    }

    function testPolicyUpdateStoresPolicy() public {
        _setPolicy(AIRiskGuardHook.RiskMode.Normal);

        (
            bool enabled,
            uint128 maxExactInputAmount,
            uint24 normalFee,
            uint24 elevatedFee,
            AIRiskGuardHook.RiskMode riskMode,
            bytes32 aiPolicyHash
        ) = hook.policies(key.toId());

        assertTrue(enabled);
        assertEqUint128(maxExactInputAmount, MAX_SWAP);
        assertEqUint24(normalFee, NORMAL_FEE);
        assertEqUint24(elevatedFee, ELEVATED_FEE);
        assertEqUint(uint256(riskMode), uint256(AIRiskGuardHook.RiskMode.Normal));
        assertEqBytes32(aiPolicyHash, POLICY_HASH);
    }

    function testBeforeSwapReturnsNormalDynamicFee() public {
        _setPolicy(AIRiskGuardHook.RiskMode.Normal);

        (bytes4 selector,, uint24 fee) =
            hook.beforeSwap(address(this), key, _exactInputSwap(100 ether), bytes(""));

        assertEqBytes4(selector, IHooks.beforeSwap.selector);
        assertEqUint24(fee, NORMAL_FEE | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    function testBeforeSwapReturnsElevatedDynamicFee() public {
        _setPolicy(AIRiskGuardHook.RiskMode.Elevated);

        (,, uint24 fee) = hook.beforeSwap(address(this), key, _exactInputSwap(100 ether), bytes(""));

        assertEqUint24(fee, ELEVATED_FEE | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    function testBeforeSwapRejectsMissingPolicy() public {
        (bool success,) = address(hook).call(
            abi.encodeCall(hook.beforeSwap, (address(this), key, _exactInputSwap(100 ether), bytes("")))
        );

        assertFalse(success);
    }

    function testBeforeSwapRejectsExactOutput() public {
        _setPolicy(AIRiskGuardHook.RiskMode.Normal);

        (bool success,) = address(hook).call(
            abi.encodeCall(hook.beforeSwap, (address(this), key, _exactOutputSwap(10 ether), bytes("")))
        );

        assertFalse(success);
    }

    function testBeforeSwapRejectsOversizedExactInput() public {
        _setPolicy(AIRiskGuardHook.RiskMode.Normal);

        (bool success,) = address(hook).call(
            abi.encodeCall(hook.beforeSwap, (address(this), key, _exactInputSwap(MAX_SWAP + 1), bytes("")))
        );

        assertFalse(success);
    }

    function testBeforeSwapRejectsBlockedMode() public {
        _setPolicy(AIRiskGuardHook.RiskMode.Blocked);

        (bool success,) = address(hook).call(
            abi.encodeCall(hook.beforeSwap, (address(this), key, _exactInputSwap(100 ether), bytes("")))
        );

        assertFalse(success);
    }

    function _setPolicy(AIRiskGuardHook.RiskMode riskMode) internal {
        hook.setPolicy(key, MAX_SWAP, NORMAL_FEE, ELEVATED_FEE, riskMode, POLICY_HASH);
    }

    function _exactInputSwap(uint256 amount) internal pure returns (SwapParams memory) {
        return SwapParams({zeroForOne: true, amountSpecified: -int256(amount), sqrtPriceLimitX96: 0});
    }

    function _exactOutputSwap(uint256 amount) internal pure returns (SwapParams memory) {
        return SwapParams({zeroForOne: true, amountSpecified: int256(amount), sqrtPriceLimitX96: 0});
    }

    function assertTrue(bool value) internal pure {
        require(value, "expected true");
    }

    function assertFalse(bool value) internal pure {
        require(!value, "expected false");
    }

    function assertEqUint(uint256 actual, uint256 expected) internal pure {
        require(actual == expected, "uint mismatch");
    }

    function assertEqUint128(uint128 actual, uint128 expected) internal pure {
        require(actual == expected, "uint128 mismatch");
    }

    function assertEqUint24(uint24 actual, uint24 expected) internal pure {
        require(actual == expected, "uint24 mismatch");
    }

    function assertEqBytes4(bytes4 actual, bytes4 expected) internal pure {
        require(actual == expected, "bytes4 mismatch");
    }

    function assertEqBytes32(bytes32 actual, bytes32 expected) internal pure {
        require(actual == expected, "bytes32 mismatch");
    }
}
