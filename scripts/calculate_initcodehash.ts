// import { bytecode } from '@uniswap/v2-core/build/UniswapV2Pair.json'
import { bytecode } from "../artifacts/contracts/PancakeFactory.sol/PancakePair.json"
import { keccak256 } from '@ethersproject/solidity';
import {utils} from "ethers";
 

import log from "../libs/logger";


async function start() {
  // console.log(bytecode)
  // const COMPUTED_INIT_CODE_HASH = keccak256(["bytes"], [`0x${bytecode}`])
  const bytes = utils.toUtf8Bytes(`0x${bytecode}`)
  const COMPUTED_INIT_CODE_HASH = utils.keccak256(bytes)
  log.Log(`pairs hashed initcode :${COMPUTED_INIT_CODE_HASH}`)
}

start()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
