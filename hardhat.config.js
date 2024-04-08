require("@nomicfoundation/hardhat-toolbox");

const NEXT_PUBLIC_POLYGON_MUMBAI_RPC = "https://rpc.ankr.com/polygon_mumbai";
const NEXT_PUBLIC_PRIVATE_KEY = "97575793cd3ae88b6c311a474e915b6b0d2afe4fa2b558c185847b8ed31f393d";
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "matic",
  networks: {
    hardhat: {},
    polygon_mumbai: {
      url: NEXT_PUBLIC_POLYGON_MUMBAI_RPC,
      accounts: [`0x${NEXT_PUBLIC_PRIVATE_KEY}`],
    },
  },
};

//  npx hardhat run --network polygon_mumbai scripts/deploy.js
