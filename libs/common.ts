import { ethers } from "hardhat";
import {Log } from "./logger"
export function numberWithCommas(x:string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export async function spendBlockHeight(count: number ){
  for(let i =0; i< count; i++){
    await ethers.provider.send("evm_mine", []);
  }
}


export const printBlockCount = async (msg: string = "") => {
  Log("> " + `block height(${await ethers.provider.getBlockNumber()})| ${msg}`)
}