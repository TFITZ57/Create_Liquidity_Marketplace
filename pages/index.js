import React, { useState, useContext } from "react";

//INTERNAL IMPORT
import {
      Header,
      Footer,
      Hero,
      ICOTokens,
      LiquidityHistory,
      ICOSale,
      Access,
      Analytic,
      App,
      AddLiquidity,
      AddPool,
      SuccessPool,
      NoPool,
      Loader,
      Input,
      PoolInput,
      HeaderICON,
      FooterICON,
} from "../components/index";

import { CONTEXT } from "../context/index"; 

const index = () => {

  const { 
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
  } = useContext(CONTEXT);

  //MODEL STATE
  const [openAddPool, setOpenAddPool] = useState(false);
  const [openAllLiquidity, setOpenAllLiquidity] = useState(false);
  
  return (
    <div classname="crumina-grid">
      <Header
        setOpenAddPool={setOpenAddPool}
        setOpenAllLiquidity={setOpenAllLiquidity}
        connect={connect}
        aaddrss={address}
      />
       <div className="main-content-wrapper">
        <Hero transferNativeToken={transferNativeToken} />
        <ICOTokens />
        <LiquidityHistory GET_ALL_LIQUIDITY={GET_ALL_LIQUIDITY} />
      </div>
    </div>
  );
};
