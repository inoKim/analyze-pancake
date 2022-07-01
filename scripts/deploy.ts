import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat"
import hre from "hardhat";
import { Contract } from "ethers";
import fs from "fs";
import l  from "../libs/logger"

require("dotenv").config()

export interface IBucket {
  Feeto: string
  WETH?:Contract
  // PancakeToken?: Contract
  PancakeFactory?: Contract
  PancakeRouter?: Contract
}
type fn = () => Promise<Contract>;



const fileName = ".deploy";
let Contracts: IBucket = { Feeto: process.env.Feeto?? "There is no env `FeeTo`" };
let Deployments: fn[] = [];

const dump = async (key: string, address :string) =>{
  const data = `${key}=${address}
`
  fs.appendFileSync(fileName, data)
}
const intiForDump = async() => {
  try{
    const time = new Date().toTimeString().split(" ")[0];
    await fs.promises.rename(fileName, `${fileName}_${time}`)
  }catch(e) {
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
  Contracts.WETH= con
  dump("tokenA", con.address)
  return con
}
const deploy_tokenB = async () => {
  const name: string = "WBNB"
  l.Deploy("tokenB")
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.WETH= con
  dump("tokenB", con.address)
  return con
}

const deploy_weth = async () => {
  const name: string = "WBNB"
  l.Deploy(name)
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy()
  Contracts.WETH= con
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

const deploying = async () => {
  await intiForDump()
  Deployments = [
    deploy_weth,
    deploy_pancakeFactory,
    deploy_pancakeRouter,
    deploy_tokenA,
    deploy_tokenB
  ]

  console.log(`d length : ${Deployments.length}`)
  for (let i  = 0; i< Deployments.length ; i++){
    console.log(`index :${i}`)
    await Deployments[i]()
  }
}
async function excute() {
  // await run("compile")
  await deploying()
  
}
excute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { deploying, Deployments ,Contracts }