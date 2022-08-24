import { ethers } from "hardhat";
import * as deployment from "../scripts/deploy";
import { Signer } from "ethers";
import { IBucket } from "../scripts/deploy";
import { Title, Deploy, Notice, Log, TitleEx } from "../libs/logger"
import { printBlockCount } from "../libs/common"

import hre from "hardhat";
import { TraceLogs } from "../libs/events";



let _signers: Signer[];
export let _dpm: IBucket;
let tx, receipt
const decimal = ethers.BigNumber.from(10).pow(18)

type exeOption = {
  useExsitContract: boolean
}
let opt: exeOption = {useExsitContract: false}

export function loadEnvs() {
  var argv = process.argv.slice(2)
  console.log('argv:' , argv)
  // opt.useExsitContract = argv["u"] === "true" ? true : false
}

export async function commonDeploy() {

  if (opt.useExsitContract) { // when -u option have been "true"
    console.log("load exsiting smart conract from .deploy")
  } else {// when -u option have been "false"
    console.log('deploy new contracts')
    await deployment.deploying()
    _dpm = deployment.Contracts

    _signers = await ethers.getSigners()
    _signers = _signers.slice(0, 3) as Signer[]

    // flowMonitor.appendToken(new Token(_dpm.TokenA!.address, "TokenA"))
    await Promise.all(_signers.map(async (item) => {
     let _tx = await  _dpm.TokenA?.transfer(await item.getAddress(), ethers.utils.parseEther("500.0"))
     let _receipt = await _tx.wait()
     TraceLogs(_receipt)
     _tx = await  _dpm.TokenB?.transfer(await item.getAddress(), ethers.utils.parseEther("500.0"))
     _receipt = await _tx.wait()
     TraceLogs(_receipt)
     _tx = await  _dpm.TokenC?.transfer(await item.getAddress(), ethers.utils.parseEther("500.0"))
     _receipt = await _tx.wait()
     TraceLogs(_receipt)
     _tx = await  _dpm.TokenD?.transfer(await item.getAddress(), ethers.utils.parseEther("500.0"))
     _receipt = await _tx.wait()
     TraceLogs(_receipt)
     _tx = await  _dpm.TokenE?.transfer(await item.getAddress(), ethers.utils.parseEther("500.0"))
     _receipt = await _tx.wait()
     TraceLogs(_receipt)
     _tx = await  _dpm.TokenF?.transfer(await item.getAddress(), ethers.utils.parseEther("500.0"))
     _receipt = await _tx.wait()
     TraceLogs(_receipt)

    }))
    // flowMonitor._watchNow().then(console.log)
  }
}
export async function commonBeforeEach() {
  console.log("👟👟👟 BeforeEach")
  // await flowMonitor._watchNow().then(console.log)
  // await ethers.provider.send("evm_mine", []);
  { // FLOW providing Liquidity TokenA&B
    Log("Addliquidity(TokenA & TokenB)>")

    // await printBlockCount("Remove Liquidity(TokenA &TokenB)")
    const _p = await _dpm.PancakeFactory?.getPair(_dpm.TokenA?.address, _dpm.TokenB?.address)
    if (_p !== '0x0000000000000000000000000000000000000000') {
      // console.log(`paircontract address : ${_p}`)
      const _pairContract = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _p)
      const _currentBalance = await _pairContract.balanceOf(provider1().getAddress())
      // console.log('current balance :', _currentBalance.toString())
      tx = await _pairContract.connect(provider1()).approve(_dpm.PancakeRouter?.address, ethers.BigNumber.from(100).mul(decimal))
      receipt = await tx.wait()
      tx = await _dpm.PancakeRouter?.connect(provider1()).removeLiquidity(
        _dpm.TokenA?.address,
        _dpm.TokenB?.address,
        _currentBalance,
        1,
        1,
        provider1().getAddress(),
        new Date().getTime() + 50000
      )
      receipt = await tx.wait()
      // console.log(`totalSUpply :${await _pairContract.totalSupply()}`)
    } else {
      Log("there is no provided LP.")
    }

    const _amount = ethers.BigNumber.from(20).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenA?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount)
    await tx.wait()

    const _amount2 = ethers.BigNumber.from(30).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenB?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount2)
    await tx.wait()

    // await printBlockCount(`Refresh LP TokenA(${_amount.toString()}) , TokenB(${_amount2.toString()})`)

    console.log('provider :', await provider1().getAddress())
    console.log('1')
    console.log('tokenA address : ',_dpm.TokenA?.address)
    console.log("TokeA balance : ",await  _dpm.TokenA?.balanceOf( await provider1().getAddress()))
    console.log('tokenB address : ',_dpm.TokenB?.address)
    console.log("TokeB balance : ",await  _dpm.TokenB?.balanceOf( await provider1().getAddress()))
    console.log('pancakeRouter : ',_dpm.PancakeRouter?.address)
    console.log("amount:" , _amount.toString())
    console.log("amount2:" , _amount2.toString())
    console.log("providier : " , await provider1().getAddress())

    // const [sentAmountTokenA, sentAmountTokenB, amountLP] = await _dpm.PancakeRouter?.connect(_signers[1]).callStatic.addLiquidity(
    //   _dpm.TokenA?.address,
    //   _dpm.TokenB?.address,
    //   _amount,
    //   _amount2,
    //   0, 0,
    //   await provider1().getAddress(),
    //   new Date().getTime() + 50000
    // )

    console.log('2')
    const _estimatedGas = await _dpm.PancakeRouter?.connect(await provider1()).estimateGas.addLiquidity(
      _dpm.TokenA?.address,
      _dpm.TokenB?.address,
      _amount,
      _amount2,
      0, 0,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )

    console.log('estimatedGas :', _estimatedGas?.toString())
    tx = await _dpm.PancakeRouter?.connect(_signers[1]).addLiquidity(
      _dpm.TokenA?.address,
      _dpm.TokenB?.address,
      _amount,
      _amount2,
      0, 0,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )
    receipt = await tx.wait()

    console.log('3')

    // await printBlockCount(`sentAmount(A: ${sentAmountTokenA.toString()} / B: ${sentAmountTokenB.toString()}) , Recieved LP Amount: ${amountLP.toString()}`)
    const _pair0Address = await _dpm.PancakeFactory?.getPair(_dpm.TokenA?.address, _dpm.TokenB?.address)
    const _pair0 = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _pair0Address)

    let _bal = await _pair0.balanceOf(provider1().getAddress())
    let [amountA, amountB, timestamp] = await _pair0.getReserves()
    /*    Log(`LP contract's reserved tokens
    amountA :${amountA}
    amountB: ${amountB}
    timestamp : ${timestamp}
      `)
      */
  }
  { // FLOW providing Liquidity TokenC&D 

    Log("Addliquidity (TokenC & TokenD)>")

    // await printBlockCount("Remove Liquidity TokenC & TokenD")
    const _p = await _dpm.PancakeFactory?.getPair(_dpm.TokenC?.address, _dpm.TokenD?.address)
    if (_p !== '0x0000000000000000000000000000000000000000') {
      const _pairContract = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _p)
      const _currentBalance = await _pairContract.connect(provider1()).balanceOf(provider1().getAddress())
      tx = await _pairContract.connect(provider1()).approve(_dpm.PancakeRouter?.address, _currentBalance)
      receipt = await tx.wait()
      tx = await _dpm.PancakeRouter?.connect(provider1()).removeLiquidity(
        _dpm.TokenC?.address,
        _dpm.TokenD?.address,
        _currentBalance,
        0,
        0,
        provider1().getAddress(),
        new Date().getTime() + 50000
      )
      receipt = await tx.wait()
    }

    const _amount = ethers.BigNumber.from(10).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenC?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount)
    await tx.wait()

    const _amount2 = ethers.BigNumber.from(10).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenD?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount2)
    await tx.wait()

    // await printBlockCount(`Refresh LP TokenC(${_amount.toString()}) , TokenD(${_amount2.toString()})`)
    const [sentAmountTokenC, sentAmountTokenD, amountLP] = await _dpm.PancakeRouter?.connect(_signers[1]).callStatic.addLiquidity(
      _dpm.TokenC?.address,
      _dpm.TokenD?.address,
      _amount,
      _amount2,
      0, 0,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )

    tx = await _dpm.PancakeRouter?.connect(_signers[1]).addLiquidity(
      _dpm.TokenC?.address,
      _dpm.TokenD?.address,
      _amount,
      _amount2,
      0, 0,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )
    receipt = await tx.wait()

    // await printBlockCount(`sentAmount(C: ${sentAmountTokenC.toString()} / D: ${sentAmountTokenD.toString()}) , Recieved LP Amount: ${amountLP.toString()}`)
    const _pair0Address = await _dpm.PancakeFactory?.getPair(_dpm.TokenC?.address, _dpm.TokenD?.address)
    const _pair0 = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _pair0Address)

    let _bal = await _pair0.balanceOf(provider1().getAddress())
    let [amountC, amountD, timestamp] = await _pair0.getReserves()
    /*    Log(`LP contract's reserved tokens
    amountC :${amountC}
    amountD: ${amountD}
    timestamp : ${timestamp}
        `)
        */
  }
  console.log("               🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 Start running 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥")
}

export const getTokenContractByAddress = async (address: string) => {
  return await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, address)
}


export const owner = () => _signers[0]
export const provider1 = () => _signers[1]
export const provider2 = () => _signers[2]
export const operator1 = () => _signers[_signers.length - 2]
export const operator2 = () => _signers[_signers.length - 1]

