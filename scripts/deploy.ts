import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat"
import hre from "hardhat";
import { Contract, Signer } from "ethers";
import fs from "fs";
import { Notice, Deploy } from "../libs/logger"
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
const DUMMY_TOTAL_AMOUNT = ethers.BigNumber.from(10).mul(ethers.BigNumber.from(10).pow(18))


const fileName = ".deploy";
let Contracts: IBucket = { Feeto: process.env.Feeto ?? "There is no env `FeeTo`" };
let Deployments: fn[] = [];

let _signers: Signer[]

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
  const name: string = "Token"
  const tokenName = "kokked ETH"
  const tokenSymbol = "kETH"
  Deploy(`tokenA :${tokenName}, latest nonce: ${await extractNonce()}`, )

  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName, tokenSymbol, ethers.BigNumber.from(100000000).mul(ethers.BigNumber.from(10).pow(18)), _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.TokenA = con
  dump(`tokenA (${tokenName})`, con.address)
  return con
}
const deploy_tokenB = async () => {
  const name: string = "Token"
  const tokenName = "kokked BTC"
  const tokenSymbol = "kBTC"
  Deploy(`tokenB :${tokenName}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName, tokenSymbol, ethers.BigNumber.from(200000000).mul(ethers.BigNumber.from(10).pow(18)), _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.TokenB = con
  dump(`tokenB(${tokenName})`, con.address)
  return con
}

const deploy_tokenC = async () => {
  const name: string = "Token"
  const tokenName = "kokked USDT"
  const tokenSymbol = "kUSDT"
  Deploy(`tokenC(${tokenName}), latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName, tokenSymbol, ethers.BigNumber.from(300000000).mul(ethers.BigNumber.from(10).pow(18)), _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.TokenC = con
  dump(`tokenC(${tokenName})`, con.address)
  return con
}
const deploy_tokenD = async () => {
  const name: string = "Token"
  const tokenName = "kokked DAI"
  const tokenSymbol = "kDAI"
  Deploy(`tokenD(${tokenName}), latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName, tokenSymbol, ethers.BigNumber.from(400000000).mul(ethers.BigNumber.from(10).pow(18)), _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.TokenD = con
  dump(`tokenD(${tokenName})`, con.address)
  return con
}

const deploy_tokenE = async () => {
  const name: string = "Token"
  const tokenName = "kokked DOT"
  const tokenSymbol = "kDOT"
  Deploy(`tokenE :${tokenName}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName, tokenSymbol, ethers.BigNumber.from(500000000).mul(ethers.BigNumber.from(10).pow(18)), _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.TokenE = con
  dump(`tokenE(${tokenName})`, con.address)
  return con
}
const deploy_tokenF = async () => {
  const name: string = "Token"
  const tokenName = "kokked XRP"
  const tokenSymbol = "kXRP"
  Deploy(`tokenF :${tokenName}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(tokenName, tokenSymbol, ethers.BigNumber.from(600000000).mul(ethers.BigNumber.from(10).pow(18)), _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.TokenF = con
  dump(`tokenF(${tokenName})`, con.address)
  return con
}
const deploy_multicallV2 = async () => {
  const name: string = "Multicall2"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()
  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(_param)
  await con.deployed()
  Contracts.WETH = con
  dump(name, con.address)
  return con
}
const deploy_weth = async () => {
  const name: string = "WBNB"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()
  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(_param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.WETH = con
  dump(name, con.address)
  return con
}

const deploy_dummy = async () => {
  const name: string = "Token"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy("DUCK-DUMMY", "dDMY", DUMMY_TOTAL_AMOUNT, _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed();
  Contracts.Dummy = con
  dump(name, con.address)
  return con
}
const deploy_cake = async () => {
  const name: string = "CakeToken"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(_param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.Cake = con
  dump(name, con.address)
  return con
}
const deploy_syrup = async () => {
  const name: string = "SyrupBar"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Cake?.address, _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.Syrup = con
  dump(name, con.address)
  return con
}
const deploy_pancakeFactory = async () => {
  const name: string = "PancakeFactory"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  let fac
  fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Feeto, _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.PancakeFactory = con
  dump(name, con.address)
  return con
}

const deploy_pancakeRouter = async () => {
  const name: string = "PancakeRouter"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.PancakeFactory?.address, Contracts.WETH?.address, _param)
  console.log('waiting for done to deployment router')
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  console.log('done to wait')
  Contracts.PancakeRouter = con
  dump(name, con.address)
  return con
}

const deploy_MasterChefV1 = async () => {
  const name: string = "MasterChef"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  const _nonce = await extractNonce()

  const _param = {
    nonce: _nonce
  }
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.Cake?.address,
    Contracts.Syrup?.address,
    process.env.Dev,
    ethers.BigNumber.from(10).mul(ethers.BigNumber.from(10).pow(18)),
    ethers.BigNumber.from(3),
    _param)
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.MasterChef = con
  dump(name, con.address)
  return con
}

const deploy_MasterChefV2 = async () => {
  const name: string = "MasterChefV2"
  Deploy(`${name}, latest nonce: ${await extractNonce()}`)
  let _nonce = await extractNonce()

  let _param = {
    nonce: _nonce
  }
  const fac = await ethers.getContractFactory(name)
  const con = await fac.deploy(Contracts.MasterChef?.address,
    Contracts.Cake?.address,
    //  ethers.BigNumber.from(256), // MasterPID
    ethers.BigNumber.from(1), // pancake은 256으로 되어있지만 지금은 MCV1에 pool이 들어가 있지 않기 떄문에 1로 설정한다
    process.env.BurnAdmin,
    _param
  )
  console.log("hashcode :", con.deployTransaction.hash)
  await con.deployed()
  Contracts.MasterChefV2 = con
  //FLOW Add staking pool for dummy token first.
  console.log('trying to add dummy pool at mcv2')
  _param.nonce = await extractNonce()
  let tx = await Contracts.MasterChef?.add(
    ethers.BigNumber.from(1).mul(ethers.BigNumber.from(10).pow(18)),
    Contracts.Dummy?.address,
    true,
    {nonce: await extractNonce()}
  )
  let receipt = await tx.wait()

  console.log('Done to add dummy pool')
  TraceLogs(receipt)

  //FLOW Add pool.
  // console.log('nonce : ' , await ethers.provider.getTransactionCount("0x3bF06584120898E4aB801218379cF0f2b3Fd8E3A"))
  tx = await Contracts.Dummy?.approve(con.address, DUMMY_TOTAL_AMOUNT , {nonce: await extractNonce()})
  receipt = await tx.wait()
  TraceLogs(receipt)

  // console.log('nonce : ' , await ethers.provider.getTransactionCount("0x3bF06584120898E4aB801218379cF0f2b3Fd8E3A"))
  tx = await con.init(Contracts.Dummy?.address, {nonce: await extractNonce()})
  receipt = await tx.wait()
  TraceLogs(receipt)
  // TraceLogs(receipt)

  dump(name, con.address)
  return con
}

const deploying = async () => {
  await intiForDump()


  _signers = await ethers.getSigners()
  _signers = _signers.slice(0, 3) as Signer[]

  Deployments = [
    deploy_multicallV2,
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

  let _nonce = await extractNonce()
  let _param = {
    nonce: _nonce
  }
  let _tx = await Contracts.Cake?.transferOwnership(Contracts.MasterChef?.address, _param)
  let _receipt = await _tx.wait()
  TraceLogs(_receipt)
  _nonce = await extractNonce()
  _param = {
    nonce: _nonce
  }
  _tx = await Contracts.Syrup?.transferOwnership(Contracts.MasterChef?.address,_param)
  _receipt = await _tx.wait()
  TraceLogs(_receipt)
}

const extractNonce = async () => {
  const _n = await ethers.provider.getTransactionCount(_signers[0].getAddress())
  Notice(`nonoce : ${_n}`)
  return _n
}

export { deploying, Deployments, Contracts }