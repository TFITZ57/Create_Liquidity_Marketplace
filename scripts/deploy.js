const hre = require("hardhat");

const tokens = (nToken) => {
    return ethers.utils.parseUnits(nToken.toString(), "ether");
}

async function main() {
    //WOOX TOKEN
    const _initialSupply = tokens(50000000);
    const Woox = await hre.ethers.getContractFactory("Woox");
    const woox = await Woox.deploy(_initialSupply);

    await woox.deployed();
    console.log(` Woox: ${woox.address}`);

    //WOOX TOKEN
    const _tokenPrice = tokens(0.0001);
    const ICOWoox = await hre.ethers.getContractFactory("ICOWoox");
    const icoWoox = await ICOWoox.deploy(woox.address, _tokenPrice);

    await icoWoox.deployed();
    console.log(` ICO WOOX: ${icoWoox.address}`);

    //LIQUIDITY
    const Liquidity = await hre.ethers.getContractFactory("Liquidity");
    const liquidity = await Liquidity.deploy();

    await liquidity.deployed();
    console.log(` Liquidity: ${liquidity.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitcode = 1;
});