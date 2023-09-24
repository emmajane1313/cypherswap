// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CypherSwapDatacore.sol";
import "./CypherSwapAccessControl.sol";

contract CypherSwapClaimReceipt is ERC20 {
    CypherSwapDatacore private _cypherSwapDatacore;
    CypherSwapAccessControl private _cypherSwapAccessControl;

    modifier onlyCypherSwapDatacoreContract() {
        require(
            msg.sender == address(_cypherSwapDatacore),
            "CypherSwapClaimReceipt: Only CypherSwapDatacore Contract can run this function."
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            _cypherSwapAccessControl.isAdmin(msg.sender),
            "CypherSwapClaimReceipt: Only Admin can run this function."
        );
        _;
    }

    constructor(
        address _cypherSwapAccessControlAddress
    ) ERC20("CypherSwapClaimReceipt", "CTGR") {
        _cypherSwapAccessControl = CypherSwapAccessControl(
            _cypherSwapAccessControlAddress
        );
    }

    function mint(
        address _to,
        uint256 _amount
    ) public onlyCypherSwapDatacoreContract {
        _mint(_to, _amount);
    }

    function burn(
        address _account,
        uint256 _amount
    ) public onlyCypherSwapDatacoreContract {
        _burn(_account, _amount);
    }

    function updateCypherSwapDatacore(address _newAddress) public {
        _cypherSwapDatacore = CypherSwapDatacore(_newAddress);
    }

    function updateCypherSwapAccessControl(address _newAddress) public {
        _cypherSwapAccessControl = CypherSwapAccessControl(_newAddress);
    }

    function getCypherSwapDatacoreAddress() public view returns (address) {
        return address(_cypherSwapDatacore);
    }

    function getCypherSwapAccessControlAddress() public view returns (address) {
        return address(_cypherSwapAccessControl);
    }
}
