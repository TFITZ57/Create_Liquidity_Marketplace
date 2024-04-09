import React, { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import Web3Modal from 'web3modal';
import axios from 'axios';
import UniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import toast from 'react-hot-toast';

import { Token } from '@uniswap/sdk-core';
import { Pool, Position, nearestUsableTick } from '@uniswap/v3-sdk';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { abi as INonfungiblePositionManagerABI } from '@uniswap/v3-periphery/artifacts/contracts/INonfungiblePositionManager.sol/INonfungiblePositionManager.json';
import ERC20_ABI from '../contect/Abi.json';


//INTERNAL IMPORTS
import {
    ERC20_ABI,
    TOKEN_ABI,
    V3_SWAP_ROUTER_ADDRESS,
    CONNECTING_CONTRACT,
    FACTORY_ADDRESS,
    web3Provider,
    positionManagerAddress,
    internalWooxContract,
    internalICOWooxContract,
    internalLiquidityContract,
    getBalance,
} from './constants';
import { parseErrorMsg } from '../utils';
import { RSC_ACTION_CLIENT_WRAPPER_ALIAS } from 'next/dist/lib/constants';

export const CONTEXT = React.createContext();

export const CONTEXTProvider = ({ children }) => {
    const DAPP_NAME = "liquidity Dapp";
    const [loader, setLoader] = useState(false);
    const [address, setAddress] = useState("");
    const [ChainId, setChainId] = useState(1);

    //TOKEN
    const [balance, setBalance] = useState(0);
    const [nativeToken, setNativeToken] = useState({});
    const [tokenHolers, setTokenHolders] = useState([]);
    const [tokenSale, setTokenSale] = useState({});
    const [currentHolder, setCurrentHolder] = useState({});
    
    //NOTIFICATION
    const notifyError = (msg) => toast.error(msg, { duration: 4000 });
    const notifySuccess = (msg) => toast.success(msg, { duration: 4000 });

    //CONNECT WALLET
    const connect = async () => {
        try {
            if (!window.ethereum) {
                notifyError("Metamask not found");
                return;
            }
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts'
            });

            if (accounts.length) {
                setAddress(accounts[0]);
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            setChainId(network.chainId);
        }   catch (error) {
            const errorMsg = parseErrorMsg(error);
            notifyError(errorMsg);
            console.log(error);
        }
    };

    //CHECK IF WALLET CONNECTED
    const checkIfWalletConnected = async () => {
        const accounts = await window.ethereum.request({
            method: 'eth_accounts'
        });
        
        return accounts[0];
    };

    const LOAD_TOKEN = async (token) => {
        try {
            const tokenDetail = await CONNECTING_CONTRACT(token);
            return tokenDetail;
        } catch (error) {
            console.log(error)
        };
    };

    //GET POOL ADDRESS
    const GET_POOL_ADDRESS = async (token) =>{
        try {
            setLoader(true);
            const PROVIDER = await web3Provider();

            const factoryContract = new ethers.Contract(
                FACTORY_ADDRESS,
                TOKEN_ABI,
                PROVIDER
            );

            const poolAddress = await factoryContract.getPool(
                token_1.address,
                token_2.address,
                token.chainId
            );

            const poolHistory = {
                token_A: token_1,
                token_B: token_2,
                fee: FeeAmount,
                network: token_1.chainId,
                poolAddress: poolAddress,
            };

            const zeroAdd = "0x0000000000000000000000000000000000000000";

            if (poolAddress == zeroAdd) {
                notifySuccess("Sorry there is no pool");
            } else {
                let poolArray = [];
                const poolLists = localStorage.getItem("poolHistory");
                if (poolLists) {
                    poolArray = JSON.parse(poolLists);
                    poolArray.push(poolHistory);
                    localStorage.setItem("poolHistory", JSON.stringify(poolArray));
                } else {
                    poolArray.push(poolHistory);
                    localStorage.setItem("poolHistory", JSON.stringify(poolArray));
                }
                setLoader(false);
                notifySuccess("Successfully Completeled");
            }
            return poolAddress;

        } catch (error) {
            const errorMsg = parseErrorMsg(error);
            setLoader(false);
            notifyError(errorMsg);
        }
    }

    //CREATE LIQUIDITY
    const getPoolData = async (poolContract) => {
        const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
            poolContract.tickSpacing(),
            poolContract.fee(),
            poolContract.liquidity(),
            poolContract.slot0(),
        ]);

        return {
            tickspacing: tickSpacing,
            fee: fee,
            liquidity: liquidity,
            slot0: slot0,
            sqrtPriceX96: slot0[0],
            tick: slot0[1],
        };
    }

    const CREATE_LIQUIDITY = async (pool, liquidityAmount, ApproveAmount) => {
        try {
            setLoader(true);
            const address = await checkIfWalletConnected();
            const PROVIDER = await web3Provider();
            const signer = PROVIDER.getSigner();

            const TOKEN_1 = new Token(
                pool,token_A.chainId,
                pool.token_A.address,
                pool.token_A.decimals,
                pool.token_A.symbol,
                pool.token_A.name,
            );
            const TOKEN_2 = new Token(
                pool.token_B.chainId,
                pool.token_B.address,
                pool.token_B.decimals,
                pool.token_B.symbol,
                pool.token_B.name,
            );
            const poolAddress = pool.poolAddress[0];

            const nonfungiblePositionManagerContract = new ethers.Contract(
                positionManagerAddress,
                INonfungiblePositionManagerABI,
                PROVIDER,
            );

            const poolContract = new ethers.Contract(
                poolAddress,
                IUniswapV3PoolABI,
                PROVIDER,
            );

            const poolData = await getPoolData(poolContract);

            const TOKEN_1_TOKEN_2_POOL = new Pool(
                TOKEN_1,
                TOKEN_2,
                poolData.fee,
                poolData.sqrtPriceX96.toString(),
                poolData.liquidity.toString(),
                poolData.tick
            );

            const position = new Position({
                pool: TOKEN_1_TOKEN_2_POOL,
                liquidity: ethers.utils.parseUnits(liquidityAmount, 18),
                tickLower: 
                    nearestUsableTick(poolData.tickSpacing, poolData.tick) -
                    poolData.tickSpacing * 2,
                tickUpper:
                    nearestUsableTick(poolData.tickSpacing, poolData.tick) +
                    poolData.tickSpacing * 2,
            });

            const approvalAmount = ethers.utils
                .parseUnits(ApproveAmount, 18)
                .toString();
            const tokenContract0 = new ethers.Contract(
                pool.token_A.address,
                ERC20ABI,
                signer,
            );

            await tokenContract0
                .connect(signer)
                .approve(positionManagerAddress, approvalAmount);

            const tokenContract1 = new ethers.Contract(
                pool.token_B.address,
                ERC20ABI,
                Signer,
            );

            await tokenContract1
                .connect(signer)
                .approve(positionManagerAddress, approvalAmount);
            
             const { amount0: amount0Desired, amount1, amount1Desired } =
                position.mintAmounts;
                // mintAmountswithSlippage
            
            const params = {
                token0: pool.token_A.address,
                token1: pool.token_B.address,
                fee: pool.fee,
                tickLower: 
                    nearestUsableTick(poolData.tick, poolData.tickspacing) -
                    poolData.tickspacing * 2,
                    tickUpper:
                    nearestUsableTick(poolData.tick, poolData.tickspacing) +
                    poolData.tickspacing * 2, 
                amount0Desired: amount0Desired.toString(),
                amount1Desired: amount1Desired.toString(),
                amount0Min: amount0Desired.toString(),
                amount1Min: amount1Desired.toString(),
                recipient: address,
                deadline: Math.floor(Date.now() / 1000) + 60 * 20,
            };

            const transactionHash = await nonfungiblePositionManagerContract
                .connect(signer)
                .mint(params, { gasLimit: ethers.utils.hexlify(1000000)})
                .then((res) => {
                    return res.transactionHash;
                });
            
            if (transactionHash) {
                const LiquidityContract = await internalLiquidityContract();

                const liquidity = await LiquidityContract
                    .connect(signer)
                    .getLiquidity(
                        pool.token_A.name,
                        pool.token_B.name,
                        pool.token_A.address,
                        pool.token_B.address,
                        pool.poolAddress,
                        transactionHash,
                    );

                await addLiquidityData.wait();

                setLoader(false);
                notifySuccess("Liquidity Added Successfully");
                window.location.reload();
            }

         }  catch (error) {
                const errorMsg = parseErrorMsg(error); 
                setLoader(false);
                notifyError(errorMsg);
                console.log(error);
            }
     }

    //NATIVE TOKEN
    const fetchInitialData = async () => {
    try {
        //GET USER ACCOUNT
        const address = await checkIfWalletConnected();
        //GET USER BALANCE
        const balance = await getBalance(address);
        setBalance(ethers.utils.formatEther(balance.toString()));

        //WOOX_TOKEN_CONTRACT
        const WOOX_CONTRACT = await internalWooxContract();

        let tokenBalance;
        if (account) {
            tokenBalance = await WOOX_CONTRACT.balanceOf(account);
        } else {
            tokenBalance = 0;
        }

        const tokenName = await WOOX_CONTRACT.name();
        const tokenSymbol = await WOOX_CONTRACT.symbol();
        const Supply = await WOOX_CONTRACT.totalSupply();
        const tokenStandard = await WOOX_CONTRACT.standard();  
        const tokenHolders = await WOOX_CONTRACT._userId(); 
        const tokenOwnerOfContract = await WOOX_CONTRACT.ownerOfContract();
        const tokenAddress = WOOX_CONTRACT.address;
        
        const nativeToken = {
            tokenAddress: tokenAddress, 
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            tokenOwnerOfContract: tokenOwnerOfContract,
            tokenStandard: tokenStandard,
            tokenTotalSupply: ethers.utils.formatEther(tokenTotalSupply.toString()),
            tokenBalance: ethers.utils.formatEther(tokenBalance.toString()),
            tokenHolders: tokenHolders.toNumber(),
        };
        setNativeToken(nativeToken);

        //GETTING TOKEN HOLDERS
        const getTokenHolders = await WOOX_CONTRACT.getTokenHolder();
        setTokenHolders(getTokenHolders);

        //GETTING TOKEN HOLDER DATA
        if (account) {
            const getTokenHolderData = await WOOX_CONTRACT.getTokenHolderData(
                account
            );
            const currentHolder = {
                tokenId: getTokenHolderData[0].toNumber(),
                from: getTokenHolderData[1],
                to: getTokenHolderData[2],
                totalToken: ethers.utils.formatEther(
                    getTokenHolderData[3].toString()
                ),
                tokenHolder: getTokenHolderData[4]
            };
            setCurrentHolder(currentHolder);
        }

        //TOKEN SALE CONTRACT 
        const ICO_WOOX_CONTRACT = await internalICOWooxContract();
        const tokenPrice = await ICO_WOOX_CONTRACT.tokenPrice();
        const tokenSold = await ICO_WOOX_CONTRACT.tokenSold();
        const tokenSaleBalance = await WOOX_TOKEN_CONTRACT.balanceOf(
            0x2b9e0C6bDee5D4DD14E8D7b1b0C70671bA1e8b02
        );

        const tokenSale = {
            tokenPrice: ethers.utils.formatEther(tokenPrice.toString()),
            tokenSold: tokenSold.toNumber(),
            tokenSaleBalance: ethers.utils.formatEther(tokenSaleBalance.toString()),
        };

        setTokenSale(tokenSale);
        console.log(tokenSale);
        console.log(nativeToken);
    } catch (error) {
        console.log(error);
    }
    }

    useEffect(() => {
        fetchInitialData();
    }, []);

    const buyToken = async (tokenAmount) => {
        try {
            setLoader(true);
            const PROVIDER = await web3Provider();
            const signer = PROVIDER.getSigner();
    
            const contract = await internalWooxContract();
            console.log(contract);
    
            const price = 0.0001 * tokenAmount; // Assuming tokenAmount is the amount of tokens to buy
            const totalAmount = ethers.utils.parseUnits(price.toString(), "ether");
    
            const buying = await contract.connect(signer).buyTokens(tokenAmount, {
                value: totalAmount.toString(),
                gasLimit: ethers.utils.hexlify(1000000),
            });
    
            await buying.wait();
            // Update your state here instead of reloading the page
    
        } catch (error) {
            const errorMsg = parseErrorMsg(error);
            console.log(error);
            setLoader(false);
            notifyError(errorMsg);
        }
    };

    //NATIVE TOKEN TRANSFER
    const transferNativeToken = async () => {
        try {
            setLoader(true);
            const PROVIDER = await web3Provider();
            const signer = PROVIDER.getSigner();

            const TOKEN_SALE_ADDRESS = "0x2b9e0C6bDee5D4DD14E8D7b1b0C70671bA1e8b02";
            const TOKEN_AMOUNT = 2000;
            const tokens = TOKENS_AMOUNT.toString();
            const transferAmount = ethers.utils.parseEther(tokens);

            const contract = await internalWooxContract();
            const transaction = await contract
                .connect(signer)
                .transfer(TOKEN_SALE_ADDRESS, transferAmount);

            await transaction.wait();
            window.location.reload();

        } catch (error) {
            const errorMsg = parseErrorMsg(error);
            console.log(error);
            setLoader(false);
            notifyError(errorMsg);
        }
    };

    //LIQUIDITY HISTORY
    const GET_ALL_LIQUIDTY = async () => {
        try {
            const account = await checkIfWalletConnected();

            const contract = await internalLiquidityContract();
            const liquidityHistory = await contract.getLiquidityHistory(account);

            const Allliquidity = liquidtyHistory.map((liquidity) => {
                const liquidityArray = {
                    id: liquidity.id.toNumber(),
                    network: liquidity.network,
                    owner: liquidity.owner,
                    poolAddress: liquidity.poolAddress,
                    tokenA: liquidity.tokenA,
                    tokenB: liquidity.tokenB,
                    tokenA_Address: liquidity.tokenA_Address,
                    tokenB_Address: liquidity.tokenB_Address,
                    timeCreated: liquidity.timeCreated.toNumber(),
                    transactionHash: liquidity.transactionHash,
                };
                return liquidityArray;
            });
            return Allliquidity;

        } catch (error){
            console.log(error)
        }
    };

    return (
        <CONTEXT.Provider
            value={{
                connect,
                GET_POOL_ADDRESS,
                LOAD_TOKEN,
                notifyError,
                notifySuccess,
                CREATE_LIQUIDITY,
                GET_ALL_LIQUIDTY,
                transferNativeToken,
                butToken,
                TokenSale,
                nativeToken,
                address,
                owner,
                DAPP_NAME,
        }}
            >
                {children}
            </CONTEXT.Provider>
    )
};
