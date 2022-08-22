import { ethers } from "hardhat";
import {Log } from "./logger"
import hre from "hardhat";
require("dotenv").config()

export function numberWithCommas(x:string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export async function spendBlockHeight(count: number ){

  if (hre.network.name=== "hardhat") {
    for(let i =0; i< count; i++){
      await ethers.provider.send("evm_mine", []);
    }
  }else{
    let _sb:any = process.env.SECOND_PER_BLOCK

    if(!_sb) {
      console.error("There is no SECOND_PER_BLOCK")
      return 
    }
    await delay(_sb  *1000 * count);
  }
}
function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export const printBlockCount = async (msg: string = "") => {
  Log("> " + `block height(${await ethers.provider.getBlockNumber()})| ${msg}`)
}