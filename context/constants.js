
//  Woox: 0x2b9e0C6bDee5D4DD14E8D7b1b0C70671bA1e8b02
//  ICO WOOX: 0x54b11cb878a6B46627A2D95bCe23F30Bfabff983
//  Liquidity: 0x6755df6F7Af899c64479B09E9e78c823a143240a 

import { ethers } from "ethers";
import Web3Modal from "web3modal";

//INTERNAL IMPORTS
import factoryAbi from ".//factoryAbi.json";
import ERC20ABI from ".//Abi.json";

import Woox from "../context/Woox.json";
import ICOWoox from "../context/ICOWoox.json";
import Liquidity from "../context/Liquidity.json";

//TOKEN 
export const Woox_ADDRESS = 0x2b9e0C6bDee5D4DD14E8D7b1b0C70671bA1e8b02
export const Woox_ABI = Woox.abi 

//TOKEN SALE
export const ICOWoox_ADDRESS = 0x54b11cb878a6B46627A2D95bCe23F30Bfabff983
export const ICOWoox_ABI = ICOWoox.abi

//LIQUIDITY
export const Liquidity_ADDRESS = 0x6755df6F7Af899c64479B09E9e78c823a143240a
export const Liquidity_ABI = Liquidity.abi

//FACTORY
export const FACTORY_ABI = factoryAbi
export const FACTORY_ADDRESS = "0x1F98431c8aD9852631AE4a59f267346ea31F984";
export const positionManagerAddress = "0xC36442b4a4522E71399CD717aBDD847Ab11FE88";

const fetchContract = (signer, ABI, ADDRESS) => 
  new ethers.Contract(signer, ABI, ADDRESS);

export const web3Provider = async () => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        return provider;
    } catch (error) {
        console.log(error);
    }
};

export const CONNECTING_CONTRACT = async (ADDRESS) => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const network = await provider.getNetwork();
        const signer = provider.getSigner();

        const fetchContract = (signer, ABI, ADDRESS);
        
        //USER ADDRESS
        const userAdress = signer.getAddress();
        const balance = await contract.getBalance(userAdress);

        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const decimals = await contract.decimals();

        const token = {
            address: address,
            name: name,
            symbol: symbol,
            decimals: decimals,
            supply: ethers.utils.formatETHER(supply.toString()),
            balance: ethers.utils.formatETHER(balance.toString()),
            chainId: network.chainId,
        };

        return token;
    } catch (error) {
        console.log(error);
    }
};

export const internalWooxContract = async () => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        
        const contract = fetchContract(provider, Woox_ABI, Woox_ADDRESS);
        return contract;
    } catch (error) {
        console.log(error);
    }
};

export const internalICOWooxContract = async () => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const contract = fetchContract(provider, ICOWoox_ABI, ICOWoox_ADDRESS);
        return contract;
    } catch (error) {
        console.log(error);
    }
};

export const internalLiquidityContract = async () => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const contract = fetchContract(provider, Liquidity_ABI, Liquidity_ADDRESS);
        return contract;
    } catch (error) {
        console.log(error);
    }
};

export const getBalance = async () => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const signer = provider.getSigner();
        return await signer.getBalance();
    } catch (error) {
        console.log(error);
    }
};








 
