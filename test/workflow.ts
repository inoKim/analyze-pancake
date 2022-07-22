import { ethers, network } from "hardhat";
import SignerWithAddress, { Signer } from "ethers";

import * as deployment from "../scripts/deploy";
import { IBucket } from "../scripts/deploy";
import { Token } from "../libs/account";
import clc from "cli-color"

import CashFlow from "../libs/account"

import l from "../libs/logger"
import { LogDescription } from "ethers/lib/utils";
import hre from "hardhat";
import {TraceLogs} from "../libs/events"

const decimal = ethers.BigNumber.from(10).pow(18)

describe(l._Title("Pancakeswap workflow ->"), () => {

  let _signers: Signer[];
  let _dpm: IBucket;

  const flowMonitor: CashFlow = new CashFlow()
  const owner = () => _signers[0]
  const provider1 = () => _signers[1]
  const provider2 = () => _signers[2]
  const operator1 = () => _signers[_signers.length - 2]
  const operator2 = () => _signers[_signers.length - 1]

  const printBlockCount = async (msg: string = "") => {
    l.Log("> " + `block height(${await ethers.provider.getBlockNumber()})| ${msg}`)
  }
  before(async () => {
    await deployment.deploying()
    _dpm = deployment.Contracts

    _signers = await ethers.getSigners()
    _signers = _signers.slice(0, 3) as Signer[]
    _signers.map(async (item) => {
      flowMonitor.appendAccount(await item.getAddress())
    })

    flowMonitor.appendToken(new Token(_dpm.TokenA!.address, "TokenA"))
    flowMonitor.appendToken(new Token(_dpm.TokenA!.address, "TokenA"))
    flowMonitor.appendToken(new Token(_dpm.TokenA!.address, "TokenA"))
    flowMonitor.appendToken(new Token(_dpm.TokenA!.address, "TokenA"))


    _signers.map(async (item) => {


      _dpm.TokenA?.deposit({ value: ethers.utils.parseEther("500.0") })
      _dpm.TokenB?.deposit({ value: ethers.utils.parseEther("500.0") })
      _dpm.TokenC?.deposit({ value: ethers.utils.parseEther("500.0") })
      _dpm.TokenD?.deposit({ value: ethers.utils.parseEther("500.0") })

      _dpm.TokenA?.transfer(await item.getAddress(), ethers.BigNumber.from(500).mul(decimal))
      _dpm.TokenB?.transfer(await item.getAddress(), ethers.BigNumber.from(500).mul(decimal))
      _dpm.TokenC?.transfer(await item.getAddress(), ethers.BigNumber.from(500).mul(decimal))
      _dpm.TokenD?.transfer(await item.getAddress(), ethers.BigNumber.from(500).mul(decimal))
    })
    // flowMonitor._watchNow().then(console.log)
  })


  beforeEach(async () => {
    console.log()
    console.log()
    console.log()
    console.log(">>--------------------------------------------------------------------------------------------------------------------<<")
    // await flowMonitor._watchNow().then(console.log)
    await ethers.provider.send("evm_mine", []);
  })

  it(l._Title("\t  ⬆⬆🔼addLiquidity"), async () => {
    l.Title("Addliquidity>")
    const _amount = ethers.BigNumber.from(10).mul(decimal).add(ethers.BigNumber.from(1000));
    let tx = await _dpm.TokenA?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount)
    await tx.wait()

    tx = await _dpm.TokenB?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount)
    await tx.wait()
    await printBlockCount("start")
    const [sentAmountTokenA, sentAmountTokenB, amountLP] = await _dpm.PancakeRouter?.connect(_signers[1]).callStatic.addLiquidity(
      _dpm.TokenA?.address,
      _dpm.TokenB?.address,
      _amount,
      _amount,
      _amount,
      _amount,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )
    await printBlockCount(`sentAmount(A: ${sentAmountTokenA.toString()} / B: ${sentAmountTokenB.toString()}) , Recieved LP Amount: ${amountLP.toString()}`)
    tx = await _dpm.PancakeRouter?.connect(_signers[1]).addLiquidity(
      _dpm.TokenA?.address,
      _dpm.TokenB?.address,
      _amount,
      _amount,
      _amount,
      _amount,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )
    let _receipt = await tx.wait()

    const _pair0Address = await _dpm.PancakeFactory?.getPair(_dpm.TokenA?.address , _dpm.TokenB?.address)
    const _pair0:any = hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi , _pair0Address)
    const _bal = await _pair0.balanceof(provider1().getAddress())
    
    await printBlockCount(`excute addLiquidity, and result: Provider1's LP balance : ${_bal.toString()}`)
    TraceLogs(_receipt)
  })
})
