// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CypherSwapDatacore.sol";
import "./CypherSwapAccessControl.sol";

contract USDTToken is ERC20 {
    constructor(
        address _addressOne,
        address _addressTwo,
        address _addressThree,
        address _addressFour
    ) ERC20("USDTToken", "USDT") {
        _mint(_addressOne, 1000000000);
        _mint(_addressTwo, 1000000000);
        _mint(_addressThree, 1000000000);
        _mint(_addressFour, 1000000000);
    }
}
