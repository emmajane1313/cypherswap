// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.19;

contract CypherSwapAccessControl {
    string public symbol;
    string public name;
    address private _assignedPKPAddress;

    mapping(address => bool) private _admins;

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event AssignedPKPAddressUpdated(address indexed pkpAddress);

    modifier onlyAdmin() {
        require(
            _admins[msg.sender],
            "CypherSwapAccessControl: Only admins can perform this action."
        );
        _;
    }

    constructor(address _pkpAddress) {
        symbol = "GAC";
        name = "CypherSwapAccessControl";
        _assignedPKPAddress = _pkpAddress;
        _admins[msg.sender] = true;
    }

    function addAdmin(address _admin) external onlyAdmin {
        require(
            !_admins[_admin],
            "CypherSwapAccessControl: Cannot add existing admin."
        );
        _admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyAdmin {
        require(
            _admin != msg.sender,
            "CypherSwapAccessControl: Cannot remove yourself as admin."
        );
        require(
            _admins[_admin],
            "CypherSwapAccessControl: Admin doesn't exist."
        );
        delete _admins[_admin];
        emit AdminRemoved(_admin);
    }

    function updateAssignedPKPAddress(
        address _newAssignedPKPAddress
    ) public onlyAdmin {
        _assignedPKPAddress = _newAssignedPKPAddress;
        emit AssignedPKPAddressUpdated(_newAssignedPKPAddress);
    }

    function isAdmin(address _address) public view returns (bool) {
        return _admins[_address];
    }

    function getAssignedPKPAddress() public view returns (address) {
        return _assignedPKPAddress;
    }
}
