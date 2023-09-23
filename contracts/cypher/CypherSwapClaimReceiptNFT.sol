// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CypherSwapDatacore.sol";
import "./CypherSwapAccessControl.sol";
import "./CypherSwapHook.sol";
import {BalanceDelta} from "./../../contracts/types/BalanceDelta.sol";

contract CypherSwapClaimReceiptNFT is ERC721 {
    CypherSwapDatacore private _cypherSwapDatacore;
    CypherSwapAccessControl private _cypherSwapAccessControl;
    CypherSwapHook private _cypherSwapHook;
    uint256 private _tokenCount;

    mapping(uint256 => uint256) private _tokenIdToPoolRatio;
    mapping(uint256 => bool) private _tokenIdToCrantComplete;
    mapping(uint256 => BalanceDelta[]) private _tokenIdToHistory;
    mapping(uint256 => uint256) private _tokenIdToMintAmount;
    mapping(address => mapping(uint256 => uint256))
        private _granteePubIdToTokenId;

    modifier onlyCypherSwapDatacoreContract() {
        require(
            msg.sender == address(_cypherSwapDatacore),
            "CypherSwapClaimReceiptNFT: Only CypherSwapDatacore Contract can run this function."
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            _cypherSwapAccessControl.isAdmin(msg.sender),
            "CypherSwapClaimReceiptNFT: Only Admin can run this function."
        );
        _;
    }

    modifier onlyCypherSwapHook() {
        require(
            msg.sender == address(_cypherSwapHook),
            "CypherSwapClaimReceiptNFT: Only CypherSwapHook Contract can run this function."
        );
        _;
    }

    modifier onlyAssignedPKP() {
        require(
            msg.sender == _cypherSwapAccessControl.getAssignedPKPAddress(),
            "CypherSwapClaimReceiptNFT: Only Assigned PKP can run this function."
        );
        _;
    }

    constructor(
        address _cypherSwapAccessControlAddress
    ) ERC721("CypherSwapClaimReceiptNFT", "CTNFT") {
        _cypherSwapAccessControl = CypherSwapAccessControl(
            _cypherSwapAccessControlAddress
        );
    }

    function mint(
        address _to,
        uint256 _pubId,
        uint256 _mintAmount
    ) public onlyCypherSwapDatacoreContract {
        _tokenCount++;
        _safeMint(_to, _tokenCount);
        _tokenIdToMintAmount[_tokenCount] = _mintAmount;
        _granteePubIdToTokenId[_to][_pubId] = _tokenCount;
    }

    function burn(
        address _owner,
        uint256 _tokenId,
        uint256 _pubId
    ) public onlyCypherSwapDatacoreContract {
        _burn(_tokenId);

        delete _tokenIdToPoolRatio[_tokenId];
        delete _granteePubIdToTokenId[_owner][_pubId];
    }

    // calculated in function off-chain
    function tokenIdMetricsToPoolRatio(
        uint256 _metricScore,
        uint256 _tokenId
    ) public onlyAssignedPKP {
        // put as 10^6 on chain
        _tokenIdToPoolRatio[_tokenId] = _metricScore;
    }

    function updateTokenIdHistory(
        uint256 _tokenId,
        BalanceDelta _balanceDelta
    ) public onlyCypherSwapHook {
        _tokenIdToHistory[_tokenId].push(_balanceDelta);
    }

    function updateGrantComplete(
        uint256 _tokenId
    ) public onlyCypherSwapDatacoreContract {
        _tokenIdToCrantComplete[_tokenId] = true;
    }

    function updateCypherSwapHook(address _newAddress) public onlyAdmin {
        _cypherSwapHook = CypherSwapHook(_newAddress);
    }

    function updateCypherSwapDatacore(address _newAddress) public onlyAdmin {
        _cypherSwapDatacore = CypherSwapDatacore(_newAddress);
    }

    function updateCypherSwapAccessControl(
        address _newAddress
    ) public onlyAdmin {
        _cypherSwapAccessControl = CypherSwapAccessControl(_newAddress);
    }

    function getCypherSwapDatacoreAddress() public view returns (address) {
        return address(_cypherSwapDatacore);
    }

    function getCypherSwapAccessControlAddress() public view returns (address) {
        return address(_cypherSwapAccessControl);
    }

    function getTotalCount() public view returns (uint256) {
        return _tokenCount;
    }

    function getTokenIdToPoolRatio(
        uint256 _tokenId
    ) public view returns (uint256) {
        return _tokenIdToPoolRatio[_tokenId];
    }

    function getPubIdToTokenId(
        address _granteeAddress,
        uint256 _pubId
    ) public view returns (uint256) {
        return _granteePubIdToTokenId[_granteeAddress][_pubId];
    }

    function getTokenIdToMintAmount(
        uint256 _tokenId
    ) public view returns (uint256) {
        return _tokenIdToMintAmount[_tokenId];
    }

    function getTokenHistoryToTokenId(
        uint256 _tokenId
    ) public view returns (BalanceDelta[] memory) {
        return _tokenIdToHistory[_tokenId];
    }

    function getTokenIdToGrantComplete(
        uint256 _tokenId
    ) public view returns (bool) {
        return _tokenIdToCrantComplete[_tokenId];
    }
}
