import { ethers } from "hardhat";
import { Log } from "./logger"
import hre from "hardhat";
import { Signer } from "ethers"
require("dotenv").config()


let _signers: Signer[]

export function numberWithCommas(x: string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function spendBlockHeight(count: number) {

  if (hre.network.name === "hardhat") {
    for (let i = 0; i < count; i++) {
      await ethers.provider.send("evm_mine", []);
    }
  } else {
    let _sb: any = process.env.SECOND_PER_BLOCK

    if (!_sb) {
      console.error("There is no SECOND_PER_BLOCK")
      return
    }
    await delay(_sb * 1000 * count);
  }
}
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const printBlockCount = async (msg: string = "") => {
  Log("> " + `block height(${await ethers.provider.getBlockNumber()})| ${msg}`)
}

export const getTxParam = async (..._s:Signer[]) => {
  if (!_signers || _signers.length == 0) {
    _signers = await ethers.getSigners()
    _signers = _signers.slice(0, 3) as Signer[]
  }
  const _target =  _s.length !==0 ? await _s[0].getAddress() :await _signers[0].getAddress()
  const _n = await ethers.provider.getTransactionCount(_target)
  // console.log(`${_target}'s nonce ${_n}`)
  return {
    nonce:  _n
  }
}