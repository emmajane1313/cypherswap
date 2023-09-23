// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.19;
// import "./CypherSwapAccessControl.sol";
import "./CypherSwapClaimReceipt.sol";
import "./CypherSwapDatacore.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolManager} from "./../contracts/interfaces/IPoolManager.sol";
import "./../contracts/libraries/TickMath.sol";
import "./types/PoolKey.sol";

contract CypherSwapTreasury {
    string public symbol;
    string public name;
    // CypherSwapAccessControl private _cypherSwapAccessControl;
    CypherSwapClaimReceipt private _cypherSwapClaimReceipt;
    CypherSwapDatacore private _cypherSwapDatacore;
    IPoolManager public _poolManager;
    IERC20 private _usdToken;
    PoolKey private _poolKey;
    address private _cypherSwapPool;
    uint256 private _usdBalance;
    uint256 private _24BonusBalance;

    event DepositTokens(address pkpAddress, uint256 bonusBalance);
    event WithdrawUSDClaim(
        address granteeAddress,
        uint256 amount,
        uint256 usdBalance
    );

    // modifier onlyAdmin() {
    //     require(
    //         _cypherSwapAccessControl.isAdmin(msg.sender),
    //         "CypherSwapTreasury: Only Admin can run this function."
    //     );
    //     _;
    // }

    // modifier onlyAssignedPKP() {
    //     require(
    //         msg.sender == _cypherSwapAccessControl.getAssignedPKPAddress(),
    //         "CypherSwapTreasury: Only Assigned PKP can run this function."
    //     );
    //     _;
    // }

    modifier onlyCypherSwapDatacore() {
        require(
            msg.sender == address(_cypherSwapDatacore),
            "CypherSwapTreasury: Only CypherSwapDatacore contract can perform this action."
        );
        _;
    }

    constructor(
        // address _cypherSwapAccessControlAddress,
        address _cypherSwapClaimReceiptAddress,
        address _cypherSwapDatacoreAddress,
        address _usdTokenAddress,
        address _poolManagerAddress,
        address _hookAddress
    ) {
        symbol = "CST";
        name = "CypherSwapTreasury";
        // _cypherSwapAccessControl = CypherSwapAccessControl(
        //     _cypherSwapAccessControlAddress
        // );
        _cypherSwapClaimReceipt = CypherSwapClaimReceipt(
            _cypherSwapClaimReceiptAddress
        );
        _cypherSwapDatacore = CypherSwapDatacore(_cypherSwapDatacoreAddress);
        _usdToken = IERC20(_usdTokenAddress);
        _poolManager = IPoolManager(_poolManagerAddress);

        // send fee back to collectors or not?
        _poolKey = PoolKey({
            currency0: Currency.wrap(address(_usdToken)),
            currency1: Currency.wrap(address(_cypherSwapClaimReceipt)),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(_hookAddress))
        });
    }

    function mapDepositedUSD() external {
        _usdBalance = _usdToken.balanceOf(address(this));
        uint256 _claimAvailable = _cypherSwapDatacore
            .getGrantAvailableClaimAmount();
        if (_usdBalance > _claimAvailable) {
            uint256 _bonusAmount = _usdBalance - _claimAvailable;
            uint256 _erc20Amount = _bonusAmount *
                (_bonusAmount / _24BonusBalance);

            if (_ensureSufficientBalance(_bonusAmount, _erc20Amount)) {
                _usdToken.approve(address(_poolManager), _bonusAmount);

                _cypherSwapClaimReceipt.mint(address(this), _bonusAmount);
                _cypherSwapClaimReceipt.approve(
                    address(_poolManager),
                    _bonusAmount
                );

                // Set the tick range to cover all prices
                int24 _tickLower = TickMath.MIN_TICK;
                int24 _tickUpper = TickMath.MAX_TICK;

                // Add liquidity
                IPoolManager.ModifyPositionParams memory params = IPoolManager
                    .ModifyPositionParams({
                        tickLower: _tickLower,
                        tickUpper: _tickUpper,
                        liquidityDelta: int256(_bonusAmount)
                    });

                _poolManager.modifyPosition(_poolKey, params, "");
            } else {
                if (_erc20Amount < _bonusAmount) {
                    // Positive Pressure
                    uint256 _erc20Received = _swapUSDTForERC20(_bonusAmount);
                    _cypherSwapClaimReceipt.burn(address(this), _erc20Received);
                } else {
                    // Negative Pressure
                    uint256 _usdtReceived = _swapERC20ForUSDT(_erc20Amount);
                    _usdBalance += _usdtReceived;
                }
            }
        }
        _24BonusBalance = _usdBalance - _claimAvailable;
        emit DepositTokens(msg.sender, _24BonusBalance);
    }

    function withdrawUSDOnClaim(
        uint256 _amount,
        address _granteeAddress
    ) external onlyCypherSwapDatacore returns (bool success) {
        require(
            _usdToken.transfer(_granteeAddress, _amount),
            "CypherSwapTreasury: Transfer failed."
        );
        _usdBalance = _cypherSwapClaimReceipt.balanceOf(address(this));

        emit WithdrawUSDClaim(_granteeAddress, _amount, _usdBalance);

        return true;
    }

    function _ensureSufficientBalance(
        uint256 _usdtAmount,
        uint256 _erc20Amount
    ) internal view returns (bool) {
        uint256 _currentUSDTBalance = _usdToken.balanceOf(address(this));
        uint256 _currentERC20Balance = _cypherSwapClaimReceipt.balanceOf(
            address(this)
        );

        return
            _currentUSDTBalance >= _usdtAmount &&
            _currentERC20Balance >= _erc20Amount;
    }

    function _swapUSDTForERC20(uint256 _usdtAmount) internal returns (uint256) {
        // Approve the PoolManager to spend USDT
        _usdToken.approve(address(_poolManager), _usdtAmount);

        uint256 _initialERC20Balance = _cypherSwapClaimReceipt.balanceOf(
            address(this)
        );

        IPoolManager.SwapParams memory _params = IPoolManager.SwapParams({
            zeroForOne: true,
            amountSpecified: int256(_usdtAmount),
            sqrtPriceLimitX96: 0
        });

        _poolManager.swap(_poolKey, _params, "");

        uint256 _finalERC20Balance = _cypherSwapClaimReceipt.balanceOf(
            address(this)
        );

        return _finalERC20Balance - _initialERC20Balance;
    }

    function _swapERC20ForUSDT(
        uint256 _erc20Amount
    ) internal returns (uint256) {
        _cypherSwapClaimReceipt.approve(address(_poolManager), _erc20Amount);

        uint256 _initialUSDTBalance = _usdToken.balanceOf(address(this));

        IPoolManager.SwapParams memory _params = IPoolManager.SwapParams({
            zeroForOne: false,
            amountSpecified: int256(_erc20Amount),
            sqrtPriceLimitX96: 0
        });

        _poolManager.swap(_poolKey, _params, "");

        uint256 _finalUSDTBalance = _usdToken.balanceOf(address(this));

        return _finalUSDTBalance - _initialUSDTBalance;
    }

    // function getCypherSwapAccessControlAddress() public view returns (address) {
    //     return address(_cypherSwapAccessControl);
    // }

    function getCypherSwapClaimReceiptAddress() public view returns (address) {
        return address(_cypherSwapClaimReceipt);
    }

    // function getCypherSwapDatacoreAddress() public view returns (address) {
    //     return address(_cypherSwapAccessControl);
    // }

    function getTotalTreasuryBalance() public view returns (uint256) {
        return _usdBalance;
    }

    function get24HourBonusBalance() public view returns (uint256) {
        return _24BonusBalance;
    }
}
