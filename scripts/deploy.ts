import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat"
import hre from "hardhat";
import { Contract } from "ethers";
import fs from "fs";
import l from "../libs/logger"

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

}
type fn = () => Promise<Contract>;



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
    l.Notice('there is no dump file.')
  }
  fs.appendFileSync(fileName, `network=${hre.network.name}`)
  fs.appendFileSync(fileName, "\n")
}

const deploy_tokenA = async () => {
  const name: string = "WBNB"
  l.Deploy("tokenA")
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.TokenA = con
  dump("tokenA", con.address)
  return con
}
const deploy_tokenB = async () => {
  const name: string = "WBNB"
  l.Deploy("tokenB")
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.TokenB = con
  dump("tokenB", con.address)
  return con
}

const deploy_tokenC = async () => {
  const name: string = "WBNB"
  l.Deploy("tokenC")
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.TokenC = con
  dump("tokenC", con.address)
  return con
}
const deploy_tokenD = async () => {
  const name: string = "WBNB"
  l.Deploy("tokenD")
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.TokenD = con
  dump("tokenD", con.address)
  return con
}

const deploy_weth = async () => {
  const name: string = "WBNB"
  l.Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.WETH = con
  dump(name, con.address)
  return con
}

const deploy_cake = async () => {
  const name: string = "CakeToken"
  l.Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.Cake = con
  dump(name, con.address)
  return con
}
const deploy_syrup = async () => {
  const name: string = "SyrupBar"
  l.Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Cake?.address)
  Contracts.Syrup = con
  dump(name, con.address)
  return con
}
const deploy_pancakeFactory = async () => {
  const name: string = "PancakeFactory"
  l.Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Feeto)
  Contracts.PancakeFactory = con
  dump(name, con.address)
  return con
}

const deploy_pancakeRouter = async () => {
  const name: string = "PancakeRouter"
  l.Deploy(name)
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.PancakeFactory?.address, Contracts.WETH?.address)
  await con.deployed()
  Contracts.PancakeRouter = con
  dump(name, con.address)
  return con
}

const deploy_MasterChefV1 = async () => {
  const name: string = "MasterChef"
  l.Deploy(name)
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Cake?.address,
    Contracts.Syrup?.address,
    process.env.Dev,
    100,
    ethers.BigNumber.from(3))
  await con.deployed()
  Contracts.MasterChef = con
  dump(name, con.address)
  return con
}

const deploy_MasterChefV2 = async () => {
  const name: string = "MasterChefV2"
  l.Deploy(name)
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.MasterChef?.address ,
     Contracts.Cake?.address,
     ethers.BigNumber.from(256), // MasterPID
     process.env.BurnAdmin
      )
  await con.deployed()
  Contracts.MasterChefV2 = con
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
    deploy_cake,
    deploy_syrup,
    deploy_MasterChefV1,
    deploy_MasterChefV2
  ]

  for (let i = 0; i < Deployments.length; i++) {
    await Deployments[i]()
  }
}
export { deploying, Deployments, Contracts }