export const shortAddress = (address) => 
  `${address?.slice(0, 6)}...${address?.slice(-4)}`;


  export const parseErrorMsg = (e) => {
    const json = JSON.parse(JSON.stringify(e));
    return json?.reson || json?.message;
  } 