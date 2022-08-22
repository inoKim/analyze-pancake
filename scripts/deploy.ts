import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat"
import hre from "hardhat";
import { Contract } from "ethers";
import fs from "fs";
import {Notice, Deploy} from "../libs/logger"
import { TraceLogs } from "../libs/events";

require("dotenv").config()

export interface IBucket {
  Feeto: string
  WETH?: Contract
  Cake?: Contract
  Syrup?: Contract
  PancakeFactory?: Contract
  PancakeRouter?: Contract
  MasterChef?: Contract
  MasterChefV2?: Contract
  TokenA?: Contract
  TokenB?: Contract
  TokenC?: Contract
  TokenD?: Contract
  TokenE?: Contract
  TokenF?: Contract
  Dummy?: Contract
}
type fn = () => Promise<Contract>;
const DUMMY_TOTAL_AMOUNT =  ethers.BigNumber.from(10).mul(ethers.BigNumber.from(10).pow(18))


const fileName = ".deploy";
let Contracts: IBucket = { Feeto: process.env.Feeto ?? "There is no env `FeeTo`" };
let Deployments: fn[] = [];

const dump = async (key: string, address: string) => {
  const data = `${key}=${address}
`
  fs.appendFileSync(fileName, data)
}
const intiForDump = async () => {
  try {
    const time = new Date().toTimeString().split(" ")[0];
    await fs.promises.rename(fileName, `${fileName}_${time}`)
  } catch (e) {
    Notice('there is no dump file.')
  }
  fs.appendFileSync(fileName, `network=${hre.network.name}`)
  fs.appendFileSync(fileName, "\n")
}

const deploy_tokenA = async () => {
  const name: string ="Token"
  const tokenName = "DUCK-ETH"
  const tokenSymbol = "dETH"
  Deploy(`tokenA :${tokenName}`)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName,tokenSymbol,ethers.BigNumber.from(100000000).mul(ethers.BigNumber.from(10).pow(18)))
  Contracts.TokenA = con
  dump(`tokenA (${tokenName})`, con.address)
  return con
}
const deploy_tokenB = async () => {
  const name: string = "Token"
  const tokenName = "DUCK-BTC"
  const tokenSymbol = "dBTC"
  Deploy(`tokenB :${tokenName}`)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName, tokenSymbol, ethers.BigNumber.from(200000000).mul(ethers.BigNumber.from(10).pow(18)))
  Contracts.TokenB = con
  dump(`tokenB(${tokenName})`, con.address)
  return con
}

const deploy_tokenC = async () => {
  const name: string = "Token"
  const tokenName = "DUCK-USDT"
  const tokenSymbol = "dUSDT"
  Deploy(`tokenC(${tokenName})`)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName,tokenSymbol,ethers.BigNumber.from(300000000).mul(ethers.BigNumber.from(10).pow(18)))
  Contracts.TokenC = con
  dump(`tokenC(${tokenName})`, con.address)
  return con
}
const deploy_tokenD = async () => {
  const name: string = "Token"
  const tokenName = "DUCK-DAI"
  const tokenSymbol = "dDAI"
  Deploy(`tokenD(${tokenName})`)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName,tokenSymbol ,ethers.BigNumber.from(400000000).mul(ethers.BigNumber.from(10).pow(18)))
  Contracts.TokenD = con
  dump(`tokenD(${tokenName})`, con.address)
  return con
}

const deploy_tokenE = async () => {
  const name: string = "Token"
  const tokenName = "DUCK-D"
  const tokenSymbol = "dDOT"
  Deploy(`tokenE :${tokenName}`)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName , tokenSymbol,ethers.BigNumber.from(500000000).mul(ethers.BigNumber.from(10).pow(18)))
  Contracts.TokenE = con
  dump(`tokenE(${tokenName})`, con.address)
  return con
}
const deploy_tokenF = async () => {
  const name: string = "Token"
  const tokenName = "DUCK-XRP"
  const tokenSymbol = "dXRP"
  Deploy(`tokenF :${tokenName}`)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName, tokenSymbol ,ethers.BigNumber.from(600000000).mul(ethers.BigNumber.from(10).pow(18)))
  Contracts.TokenF = con
  dump(`tokenF(${tokenName})`, con.address)
  return con
}
const deploy_weth = async () => {
  const name: string = "WBNB"
  Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.WETH = con
  dump(name, con.address)
  return con
}

const deploy_dummy = async () => {
  const name: string = "Token"
  Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy("DUCK-DUMMY" , "dDMY", DUMMY_TOTAL_AMOUNT)
  await con.deployed();
  Contracts.Dummy = con
  dump(name, con.address)
  return con
}
const deploy_cake = async () => {
  const name: string = "CakeToken"
  Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.Cake = con
  dump(name, con.address)
  return con
}
const deploy_syrup = async () => {
  const name: string = "SyrupBar"
  Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Cake?.address)
  Contracts.Syrup = con
  dump(name, con.address)
  return con
}
const deploy_pancakeFactory = async () => {
  const name: string = "PancakeFactory"
  Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Feeto)
  Contracts.PancakeFactory = con
  dump(name, con.address)
  return con
}

const deploy_pancakeRouter = async () => {
  const name: string = "PancakeRouter"
  Deploy(name)
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.PancakeFactory?.address, Contracts.WETH?.address)
  await con.deployed()
  Contracts.PancakeRouter = con
  dump(name, con.address)
  return con
}

const deploy_MasterChefV1 = async () => {
  const name: string = "MasterChef"
  Deploy(name)
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Cake?.address,
    Contracts.Syrup?.address,
    process.env.Dev,
    ethers.BigNumber.from(10).mul(ethers.BigNumber.from(10).pow(18)),
    ethers.BigNumber.from(3))
  await con.deployed()
  Contracts.MasterChef = con
  dump(name, con.address)
  return con
}

const deploy_MasterChefV2 = async () => {
  const name: string = "MasterChefV2"
  Deploy(name)
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.MasterChef?.address ,
     Contracts.Cake?.address,
    //  ethers.BigNumber.from(256), // MasterPID
     ethers.BigNumber.from(1), // pancake은 256으로 되어있지만 지금은 MCV1에 pool이 들어가 있지 않기 떄문에 1로 설정한다
     process.env.BurnAdmin
      )
  await con.deployed()
  Contracts.MasterChefV2 = con
  //FLOW Add staking pool for dummy token first.
  let tx = await Contracts.MasterChef?.add(
    ethers.BigNumber.from(1).mul(ethers.BigNumber.from(10).pow(18)),
    Contracts.Dummy?.address,
    true
    )
  let receipt = await tx.wait()
  

  //FLOW Add pool.
  tx = await Contracts.Dummy?.approve(con.address, DUMMY_TOTAL_AMOUNT)
  receipt = await tx.wait()

  tx = await  con.init(Contracts.Dummy?.address)
  receipt = await tx.wait()
  // TraceLogs(receipt)

  dump(name, con.address)
  return con
}

const deploying = async () => {
  await intiForDump()
Deployments = [
    deploy_weth,
    deploy_pancakeFactory,
    deploy_pancakeRouter,
    deploy_tokenA,
    deploy_tokenB,
    deploy_tokenC,
    deploy_tokenD,
    deploy_tokenE,
    deploy_tokenF,
    deploy_cake,
    deploy_syrup,
    deploy_dummy,
    deploy_MasterChefV1,
    deploy_MasterChefV2,
  ]

  for (let i = 0; i < Deployments.length; i++) {
    await Deployments[i]()
  }

  let _tx = await Contracts.Cake?.transferOwnership(Contracts.MasterChef?.address)
  let _receipt = await _tx.wait()
  _tx = await Contracts.Syrup?.transferOwnership(Contracts.MasterChef?.address)
  _receipt = await _tx.wait()
}
export { deploying, Deployments, Contracts }