// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import {IPoolManager} from "./../../contracts/interfaces/IPoolManager.sol";
import {Hooks} from "./../../contracts/libraries/Hooks.sol";
import {BaseHook} from "./../../contracts/BaseHook.sol";
import {BalanceDelta} from "./../../contracts/types/BalanceDelta.sol";
import "./CypherSwapTreasury.sol";
import "./../types/PoolKey.sol";
import "./CypherSwapClaimReceiptNFT.sol";

contract CypherSwapHook is BaseHook {
    CypherSwapTreasury private _cypherSwapTreasury;
    CypherSwapClaimReceiptNFT private _cypherSwapClaimReceiptNFT;

    error outOfTime();

    modifier onlyCypherSwapTreasury() {
        require(
            msg.sender == address(_cypherSwapTreasury),
            "CypherSwapHook: Only the CypherSwapTreasury address can provide liquidity."
        );
        _;
    }

    constructor(
        IPoolManager _poolManager,
        address _cypherSwapClaimReceiptNFTAddress
    ) BaseHook(_poolManager) {
        _cypherSwapClaimReceiptNFT = CypherSwapClaimReceiptNFT(
            _cypherSwapClaimReceiptNFTAddress
        );
    }

    function getHooksCalls() public pure override returns (Hooks.Calls memory) {
        return
            Hooks.Calls({
                beforeInitialize: false,
                afterInitialize: false,
                beforeModifyPosition: true,
                afterModifyPosition: false,
                beforeSwap: true,
                afterSwap: true,
                beforeDonate: false,
                afterDonate: false
            });
    }

    function beforeModifyPosition(
        address,
        PoolKey calldata,
        IPoolManager.ModifyPositionParams calldata,
        bytes calldata
    )
        external
        view
        override
        poolManagerOnly
        onlyCypherSwapTreasury
        returns (bytes4)
    {
        return BaseHook.beforeModifyPosition.selector;
    }

    function beforeSwap(
        address,
        PoolKey calldata,
        IPoolManager.SwapParams calldata params,
        bytes calldata
    ) external view override poolManagerOnly returns (bytes4) {
        if (params.zeroForOne) {
            require(
                msg.sender == address(_cypherSwapTreasury),
                "CypherSwapHook: Only the CypherSwapTreasury can swap USDT for ERC20."
            );
        }

        return BaseHook.beforeSwap.selector;
    }

    function afterSwap(
        address,
        PoolKey calldata,
        IPoolManager.SwapParams calldata,
        BalanceDelta balanceDelta,
        bytes calldata hookData
    ) external override poolManagerOnly returns (bytes4) {
        if (hookData.length > 0) {
            uint256 _tokenId = abi.decode(hookData, (uint256));

            if (_cypherSwapClaimReceiptNFT.ownerOf(_tokenId) == msg.sender) {
                _cypherSwapClaimReceiptNFT.updateTokenIdHistory(
                    _tokenId,
                    balanceDelta
                );
            }
        }

        return BaseHook.beforeSwap.selector;
    }

    function setTreasuryAddress(address _cypherSwapTreasuryAddress) public {
        _cypherSwapTreasury = CypherSwapTreasury(_cypherSwapTreasuryAddress);
    }
}
