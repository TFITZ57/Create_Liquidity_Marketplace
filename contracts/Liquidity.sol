//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Liquidity {

    address public admin;

    mapping(address => LiquidityInfo[]) public liquidities;
    uint256 public liquidityId;

    struct LiquidityInfo {
        uint256 id;
        address owner;
        string tokenA;
        string tokenB;
        string tokenA_Address;
        string tokenB_Address;
        string poolAddress;
        string network;
        string transactionHash;
        uint timeCreated;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addLiquidity(
        string memory _tokenA,
        string memory _tokenB,
        string memory _tokenA_Address,
        string memory _tokenB_Address,
        string memory _poolAddress,
        string memory _network,
        string memory _transactionHash
     )  external {
        liquidityId++;
        uint256 currentLiquidityID = liquidityId;

        liquidities[msg.sender].push(LiquidityInfo({
            id: currentLiquidityID,
            owner: msg.sender,
            tokenA: _tokenA,
            tokenB: _tokenB,
            tokenA_Address: _tokenA_Address,
            tokenB_Address: _tokenB_Address,
            poolAddress: _poolAddress,
            network: _network,
            transactionHash: _transactionHash,
            timeCreated: block.timestamp
        }));
    } 

    function getAllLiquidity(address _address) public view returns(LiquidityInfo[] memory) {
        return liquidities[_address];
    }

    function transferEther() external payable {
        require(msg.value > 0, "Amount needs to be greater than 0");

        (bool success, ) = admin.call{value: msg.value}("");
        require(success, "Failed to send Ether");
    }
}