// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.19;

import {LensHub, DataTypes} from "@aave/lens-protocol/contracts/core/LensHub.sol";
import {IPoolManager,Currency} from "./../../contracts/interfaces/IPoolManager.sol";
import "./CypherSwapAccessControl.sol";
import "./CypherSwapClaimReceipt.sol";
import "./CypherSwapTreasury.sol";
import "./CypherSwapClaimReceiptNFT.sol";
import "./CypherSwapHook.sol";

library CypherSwapParamsLibrary {
    struct InitializeGrant {
        address[] _granteeAddresses;
        uint256[] _milestoneId;
        uint256[] _claimBy;
        uint256[] _claimFrom;
        uint256[] _amount;
        uint256[] _splitAmounts;
        uint256 _pubId;
    }
}

/// @title CypherSwapDatacore
contract CypherSwapDatacore {
    string public symbol;
    string public name;
    CypherSwapAccessControl private _cypherSwapAccessControl;
    CypherSwapClaimReceipt private _cypherSwapClaimReceipt;
    CypherSwapClaimReceiptNFT private _cypherSwapClaimReceiptNFT;
    LensHub private _lensHub;
    IPoolManager public _poolManager;
    CypherSwapHook private _cypherSwapHook;
    CypherSwapTreasury private _cypherSwapTreasury;
    address private _usdtToken;
    uint256 private _grantClaimAmount;
    uint256 public constant MAX_SPLIT_AMOUNT = 100;

    enum Status {
        Active,
        Complete
    }

    struct Milestone {
        Status status;
        uint256 milestoneId;
        uint256 claimBy;
        uint256 claimFrom;
        uint256 amount;
    }

    struct Grant {
        address[] granteeAddresses;
        Status status;
        uint256 postId;
        uint256 profileId;
        uint256 milestoneCount;
    }

    mapping(address => bytes32) private _addressToIdentifier;
    mapping(bytes32 => mapping(uint256 => Grant)) private _identifierToGrant;
    mapping(bytes32 => mapping(uint256 => mapping(uint256 => Milestone)))
        private _identifierToGrantMilestone;
    mapping(bytes32 => mapping(uint256 => mapping(uint256 => mapping(address => bool))))
        private _milestoneClaims;
    mapping(bytes32 => mapping(uint256 => mapping(address => uint256)))
        private _addressToSplit;

    event NewGrantInitialized(
        address granteeAddress,
        uint256 milestoneCount,
        uint256 indexed postId,
        uint256 profileId
    );
    event MilestoneComplete(
        address granteeAddress,
        uint256 milestoneId,
        uint256 amount,
        uint256 indexed postId
    );
    event GrantComplete(
        address granteeAddress,
        uint256 totalAmount,
        uint256 indexed postId,
        uint256 profileId
    );

    modifier onlyAssignedPKP() {
        require(
            msg.sender == _cypherSwapAccessControl.getAssignedPKPAddress(),
            "CypherSwapDatacore: Only Assigned PKP can run this function."
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            _cypherSwapAccessControl.isAdmin(msg.sender),
            "CypherSwapDatacore: Only Admin can run this function."
        );
        _;
    }

    modifier onlyGranteeAddress(uint256 _postId) {
        bytes32 _grantIdentifier = _addressToIdentifier[msg.sender];
        require(
            _identifierToGrant[_grantIdentifier][_postId].postId != 0,
            "CypherSwapDatacore: Only a Grantee Address can run this function."
        );
        _;
    }

    constructor(
        address _cypherSwapAccessControlAddress,
        address _cypherSwapClaimReceiptAddress,
        address _lensHubAddress,
        address _cypherSwapClaimReceiptNFTAddress,
        address _poolManagerAddress,
        address _usdtTokenAddress
    ) {
        symbol = "GrantDatabase";
        name = "GDB";
        _cypherSwapAccessControl = CypherSwapAccessControl(
            _cypherSwapAccessControlAddress
        );
        _cypherSwapClaimReceipt = CypherSwapClaimReceipt(
            _cypherSwapClaimReceiptAddress
        );
        _lensHub = LensHub(_lensHubAddress);
        _cypherSwapClaimReceiptNFT = CypherSwapClaimReceiptNFT(
            _cypherSwapClaimReceiptNFTAddress
        );
        _poolManager = IPoolManager(_poolManagerAddress);
        _usdtToken = _usdtTokenAddress;
    }

    function initializeGrantRecipient(
        CypherSwapParamsLibrary.InitializeGrant memory _initializeGrantParams
    ) public onlyAssignedPKP {
        require(
            _initializeGrantParams._milestoneId.length ==
                _initializeGrantParams._claimBy.length &&
                _initializeGrantParams._claimFrom.length ==
                _initializeGrantParams._amount.length,
            "CypherSwapDatacore: Milestone details must match length."
        );
        require(
            _initializeGrantParams._granteeAddresses.length ==
                _initializeGrantParams._splitAmounts.length,
            "CypherSwapDatacore: Grantee Addresses must match Split Amounts length."
        );
        require(
            _initializeGrantParams._amount.length >= 3,
            "CypherSwapDatacore: Minimum of 3 Milestones."
        );

        uint256 _totalSplit = 0;
        for (
            uint256 i = 0;
            i < _initializeGrantParams._splitAmounts.length;
            i++
        ) {
            _totalSplit += _initializeGrantParams._splitAmounts[i];
        }
        require(
            _totalSplit <= MAX_SPLIT_AMOUNT,
            "CypherSwapDatacore: Total of Split Amounts cannot exceed 100."
        );

        bool _senderIsGrantee = false;
        for (
            uint256 i = 0;
            i < _initializeGrantParams._granteeAddresses.length;
            i++
        ) {
            if (_initializeGrantParams._granteeAddresses[i] == msg.sender) {
                _senderIsGrantee = true;
                break;
            }
        }
        require(
            _senderIsGrantee,
            "CypherSwapDatacore: msg.sender must be in the list of grantee addresses."
        );

        uint256 _profileId = _lensHub.defaultProfile(msg.sender);

        require(
            _lensHub.getPubCount(_profileId) == _initializeGrantParams._pubId,
            "CypherSwapDatacore: Grant post must be latest publication."
        );

        DataTypes.PublicationStruct memory _grantPost = _lensHub.getPub(
            _profileId,
            _initializeGrantParams._pubId
        );

        require(
            keccak256(abi.encodePacked(_grantPost.contentURI)) !=
                keccak256(abi.encodePacked("")),
            "CypherSwapDatacore: Grant Post does not exist."
        );

        bytes32 _grantIdentifier = keccak256(
            abi.encodePacked(
                _initializeGrantParams._granteeAddresses,
                _initializeGrantParams._pubId
            )
        );

        for (
            uint256 i = 0;
            i < _initializeGrantParams._granteeAddresses.length;
            i++
        ) {
            _addressToIdentifier[
                _initializeGrantParams._granteeAddresses[i]
            ] = _grantIdentifier;
        }

        _identifierToGrant[_grantIdentifier][_initializeGrantParams._pubId]
            .postId = _initializeGrantParams._pubId;
        _identifierToGrant[_grantIdentifier][_initializeGrantParams._pubId]
            .profileId = _profileId;
        _identifierToGrant[_grantIdentifier][_initializeGrantParams._pubId]
            .status = Status.Active;
        _identifierToGrant[_grantIdentifier][_initializeGrantParams._pubId]
            .milestoneCount = _initializeGrantParams._amount.length;
        _identifierToGrant[_grantIdentifier][_initializeGrantParams._pubId]
            .granteeAddresses = _initializeGrantParams._granteeAddresses;

        uint256 _totalAmount = 0;

        for (uint256 i = 0; i < _initializeGrantParams._amount.length; i++) {
            _identifierToGrantMilestone[_grantIdentifier][
                _initializeGrantParams._pubId
            ][i].status = Status.Active;
            _identifierToGrantMilestone[_grantIdentifier][
                _initializeGrantParams._pubId
            ][i].milestoneId = i;
            _identifierToGrantMilestone[_grantIdentifier][
                _initializeGrantParams._pubId
            ][i].claimBy = _initializeGrantParams._claimBy[i];
            _identifierToGrantMilestone[_grantIdentifier][
                _initializeGrantParams._pubId
            ][i].claimFrom = _initializeGrantParams._claimFrom[i];
            _identifierToGrantMilestone[_grantIdentifier][
                _initializeGrantParams._pubId
            ][i].amount = _initializeGrantParams._amount[i];

            _totalAmount += _initializeGrantParams._amount[i];
        }

        for (
            uint256 i = 0;
            i < _initializeGrantParams._granteeAddresses.length;
            i++
        ) {
            uint256 _splitAmount = _initializeGrantParams._splitAmounts[i];
            address _granteeAddress = _initializeGrantParams._granteeAddresses[
                i
            ];

            for (
                uint256 j = 0;
                j < _initializeGrantParams._amount.length;
                j++
            ) {
                uint256 amount = _initializeGrantParams._amount[j];

                _addressToSplit[_grantIdentifier][
                    _initializeGrantParams._pubId
                ][_granteeAddress] = (amount * _splitAmount) / MAX_SPLIT_AMOUNT;

                _milestoneClaims[_grantIdentifier][
                    _initializeGrantParams._pubId
                ][j][_granteeAddress] = false;
            }

            uint256 _mintAmount = (_totalAmount *
                _initializeGrantParams._splitAmounts[i]) / MAX_SPLIT_AMOUNT;

            _cypherSwapClaimReceiptNFT.mint(
                _granteeAddress,
                _initializeGrantParams._pubId,
                _mintAmount
            );
        }

        _grantClaimAmount += _totalAmount;

        emit NewGrantInitialized(
            msg.sender,
            _initializeGrantParams._amount.length,
            _initializeGrantParams._pubId,
            _profileId
        );
    }

    function claimMilestoneAmount(
        uint256 _pubId,
        uint256 _milestoneId
    ) public onlyGranteeAddress(_pubId) {
        bytes32 _grantIdentifier = _addressToIdentifier[msg.sender];
        Milestone storage _milestone = _identifierToGrantMilestone[
            _grantIdentifier
        ][_pubId][_milestoneId];

        require(
            _milestone.status != Status.Complete,
            "CypherSwapDatacore: Milestone claimed by all grantees."
        );
        require(
            !_milestoneClaims[_grantIdentifier][_pubId][_milestoneId][
                msg.sender
            ],
            "CypherSwapDatacore: Milestone already claimed by this Grantee."
        );

        require(
            block.timestamp >= _milestone.claimFrom &&
                block.timestamp <= _milestone.claimBy,
            "CypherSwapDatacore: Invalid time for claiming."
        );

        uint256 _milestoneAmount = _milestone.amount;

        uint256 _granteeSplit = _addressToSplit[_grantIdentifier][_pubId][
            msg.sender
        ];
        uint256 _requiredAmount = _milestoneAmount / _granteeSplit;

        require(
            _cypherSwapTreasury.withdrawUSDOnClaim(_requiredAmount, msg.sender),
            "CypherSwapDatacore: Claim failed to Grantee address."
        );

        _milestoneClaims[_grantIdentifier][_pubId][_milestoneId][
            msg.sender
        ] = true;

        _grantClaimAmount -= _requiredAmount;

        uint256 _claimedCount = 0;

        for (
            uint256 i = 0;
            i <
            _identifierToGrant[_grantIdentifier][_pubId]
                .granteeAddresses
                .length;
            i++
        ) {
            if (
                _milestoneClaims[_grantIdentifier][_pubId][_milestoneId][
                    _identifierToGrant[_grantIdentifier][_pubId]
                        .granteeAddresses[i]
                ]
            ) {
                _claimedCount++;
            }
        }

        if (
            _claimedCount ==
            _identifierToGrant[_grantIdentifier][_pubId].granteeAddresses.length
        ) {
            _milestone.status = Status.Complete;
        }

        emit MilestoneComplete(
            msg.sender,
            _milestoneId,
            _requiredAmount,
            _pubId
        );

        if (
            _milestoneId ==
            _identifierToGrant[_grantIdentifier][_pubId].milestoneCount
        ) {
            _identifierToGrant[_grantIdentifier][_pubId].status = Status
                .Complete;
            emit GrantComplete(
                msg.sender,
                _requiredAmount,
                _pubId,
                _identifierToGrant[_grantIdentifier][_pubId].profileId
            );
        }
    }

    function claimBonus(uint256 _pubId) public onlyGranteeAddress(_pubId) {
        bytes32 _grantIdentifier = _addressToIdentifier[msg.sender];
        require(
            _identifierToGrant[_grantIdentifier][_pubId].status ==
                Status.Complete,
            "CypherSwapDatacore: All Milestones must be claimed by all grantees."
        );
        uint256 _nftTokenId = _cypherSwapClaimReceiptNFT.getPubIdToTokenId(
            msg.sender,
            _pubId
        );

        require(
            _nftTokenId != 0,
            "CypherSwapDatacore: Invalid Bonus Claim NFT."
        );

        uint256 _percentMintAmount = _cypherSwapClaimReceiptNFT
            .getTokenIdToPoolRatio(_nftTokenId);

        require(
            _cypherSwapClaimReceiptNFT.ownerOf(_nftTokenId) == msg.sender,
            "CypherSwapDatacore: You must own the NFT you want to claim for."
        );
        require(
            !_cypherSwapClaimReceiptNFT.getTokenIdToGrantComplete(_nftTokenId),
            "CypherSwapDatacore: NFT already claimed receipts."
        );

        _cypherSwapClaimReceiptNFT.updateGrantComplete(_nftTokenId);

        // store to ^6
        uint256 _mintAmount = (
            (_percentMintAmount / (MAX_SPLIT_AMOUNT * MAX_SPLIT_AMOUNT))
        ) * _poolManager.reservesOf(Currency.wrap(_usdtToken));

        _cypherSwapClaimReceipt.mint(msg.sender, _mintAmount);
    }

    function setCypherSwapTreasury(
        address _grantTreasuryAddress
    ) public onlyAdmin {
        _cypherSwapTreasury = CypherSwapTreasury(_grantTreasuryAddress);
    }

    function updateCypherSwapAccessControl(
        address _newAddress
    ) public onlyAdmin {
        _cypherSwapAccessControl = CypherSwapAccessControl(_newAddress);
    }

    function updateCypherSwapClaimReceipt(
        address _newAddress
    ) public onlyAdmin {
        _cypherSwapClaimReceipt = CypherSwapClaimReceipt(_newAddress);
    }

    function updateLensHub(address _newAddress) public onlyAdmin {
        _lensHub = LensHub(_newAddress);
    }

    function updateCypherSwapHook(address _newAddress) public onlyAdmin {
        _cypherSwapHook = CypherSwapHook(_newAddress);
    }

    function getGrantProfileId(
        address _granteeAddress,
        uint256 _grantPostId
    ) public view returns (uint256) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return _identifierToGrant[_grantIdentifier][_grantPostId].profileId;
    }

    function getGrantGranteeAddresses(
        address _granteeAddress,
        uint256 _grantPostId
    ) public view returns (address[] memory) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return
            _identifierToGrant[_grantIdentifier][_grantPostId].granteeAddresses;
    }

    function getGrantMilestoneCount(
        address _granteeAddress,
        uint256 _grantPostId
    ) public view returns (uint256) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return
            _identifierToGrant[_grantIdentifier][_grantPostId].milestoneCount;
    }

    function getGrantStatus(
        address _granteeAddress,
        uint256 _grantPostId
    ) public view returns (Status) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return _identifierToGrant[_grantIdentifier][_grantPostId].status;
    }

    function getGrantMilestoneClaimBy(
        address _granteeAddress,
        uint256 _grantPostId,
        uint256 _milestoneId
    ) public view returns (uint256) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return
            _identifierToGrantMilestone[_grantIdentifier][_grantPostId][
                _milestoneId
            ].claimBy;
    }

    function getGrantMilestoneClaimFrom(
        address _granteeAddress,
        uint256 _grantPostId,
        uint256 _milestoneId
    ) public view returns (uint256) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return
            _identifierToGrantMilestone[_grantIdentifier][_grantPostId][
                _milestoneId
            ].claimFrom;
    }

    function getGrantMilestoneAmount(
        address _granteeAddress,
        uint256 _grantPostId,
        uint256 _milestoneId
    ) public view returns (uint256) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return
            _identifierToGrantMilestone[_grantIdentifier][_grantPostId][
                _milestoneId
            ].amount;
    }

    function getGrantMilestoneStatus(
        address _granteeAddress,
        uint256 _grantPostId,
        uint256 _milestoneId
    ) public view returns (Status) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return
            _identifierToGrantMilestone[_grantIdentifier][_grantPostId][
                _milestoneId
            ].status;
    }

    function getGranteeAddressToSplit(
        address _granteeAddress,
        uint256 _grantPostId
    ) public view returns (uint256) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return _addressToSplit[_grantIdentifier][_grantPostId][_granteeAddress];
    }

    function getGranteeAddressMilestoneClaimed(
        address _granteeAddress,
        uint256 _grantPostId,
        uint256 _milestoneId
    ) public view returns (bool) {
        bytes32 _grantIdentifier = _addressToIdentifier[_granteeAddress];
        return
            _milestoneClaims[_grantIdentifier][_grantPostId][_milestoneId][
                _granteeAddress
            ];
    }

    function getCypherSwapAccessControlAddress() public view returns (address) {
        return address(_cypherSwapAccessControl);
    }

    function getCypherSwapClaimReceiptAddress() public view returns (address) {
        return address(_cypherSwapClaimReceipt);
    }

    function getLensHubAddress() public view returns (address) {
        return address(_lensHub);
    }

    function getCypherSwapHookAddress() public view returns (address) {
        return address(_cypherSwapHook);
    }

    function getCypherSwapTreasury() public view returns (address) {
        return address(_cypherSwapTreasury);
    }

    function getGrantAvailableClaimAmount() public view returns (uint256) {
        return _grantClaimAmount;
    }
}
