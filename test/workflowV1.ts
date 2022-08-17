import { ethers } from "hardhat";
import { Signer } from "ethers";

import { IBucket } from "../scripts/deploy";

import CashFlow from "../libs/account"

import { Title, Log, TitleEx } from "../libs/logger"
import hre from "hardhat";
import { TraceLogs } from "../libs/events"
import { numberWithCommas, spendBlockHeight } from "../libs/common";
import { expect } from "chai";

import {commonDeploy, commonBeforeEach , provider1, provider2, owner, operator1, operator2, _dpm} from "./common"

const decimal = ethers.BigNumber.from(10).pow(18)
let tx, receipt
describe(TitleEx("Pancakeswap workflow ->"), () => {

  let _signers: Signer[];
  let _dpm: IBucket;

  const flowMonitor: CashFlow = new CashFlow()

  const printBlockCount = async (msg: string = "") => {
    Log("> " + `block height(${await ethers.provider.getBlockNumber()})| ${msg}`)
  }
  before(async () => { await commonDeploy() })
  beforeEach(async () => { await commonBeforeEach()})


  // -comment-   __    __  _ __   __   __    ___   ___    /7    __    __  _ __   __   __    ___   ___    /7    __    __  _ __   __   __    ___   ___    /7
  // -comment-  /  \  / / /// /  / /  /  \  / _/  / o |  //    /  \  / / /// /  / /  /  \  / _/  / o |  //    /  \  / / /// /  / /  /  \  / _/  / o |  // 
  // -comment- / o | / / | V /  / /  / o | / _/  /  ,'        / o | / / | V /  / /  / o | / _/  /  ,'        / o | / / | V /  / /  / o | / _/  /  ,'      
  // -comment-/__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()    /__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()    /__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()   

  it(TitleEx("\t signle hop swap"), async () => {
    Title("Swap using single hop")
    const _amount1 = ethers.BigNumber.from(5).mul(decimal)
    const _pair0Address = await _dpm.PancakeFactory?.getPair(_dpm.TokenA?.address, _dpm.TokenB?.address)

    const _pair0 = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _pair0Address)
    console.log("pair0's address: ", _pair0Address)
    const amountsOut = await _dpm.PancakeRouter?.getAmountsOut(_amount1, [_dpm.TokenA?.address, _dpm.TokenB?.address])
    Log(`amounts desire IN/ guess OUT : ${amountsOut.map((item: any) => ethers.utils.formatUnits(item, "ether"))}`)

    tx = await _dpm.TokenA?.approve(_dpm.PancakeRouter?.address, _amount1)
    receipt = await tx.wait()


    tx = await _dpm.PancakeRouter?.swapExactTokensForTokens(
      amountsOut[0],
      amountsOut[1],
      [_dpm.TokenA?.address, _dpm.TokenB?.address],
      provider1().getAddress(),
      new Date().getTime() + 10000
    )
    receipt = await tx.wait()
    TraceLogs(receipt)
    let [amountA, amountB] = await _pair0.getReserves()
    Log(`LP contract's reserved tokens
amountA:${ethers.utils.formatUnits(amountA, "ether")}
amountB: ${ethers.utils.formatUnits(amountB, "ether")}
    `)
  })
  // -comment-   __    __  _ __   __   __    ___   ___    /7    __    __  _ __   __   __    ___   ___    /7    __    __  _ __   __   __    ___   ___    /7
  // -comment-  /  \  / / /// /  / /  /  \  / _/  / o |  //    /  \  / / /// /  / /  /  \  / _/  / o |  //    /  \  / / /// /  / /  /  \  / _/  / o |  // 
  // -comment- / o | / / | V /  / /  / o | / _/  /  ,'        / o | / / | V /  / /  / o | / _/  /  ,'        / o | / / | V /  / /  / o | / _/  /  ,'      
  // -comment-/__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()    /__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()    /__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()   
 
  it.only(TitleEx("\t deposit"), async() =>{

    const _allocPoint = await ethers.BigNumber.from(1).mul(decimal)
    const _pair0Address = await _dpm.PancakeFactory?.getPair(_dpm.TokenA?.address, _dpm.TokenB?.address)
    const _pair0 = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _pair0Address)
    const _bal = await _pair0.balanceOf(provider1().getAddress())
    Log(`provider1's Lp(TokenA & TokenB) balance : ${ethers.utils.formatEther(_bal.toString())}`)
    // 8000000 00000000 0000000000
    // FLOW add staking pool
    tx = await _dpm.MasterChef?.add(_allocPoint , _pair0Address, true)
    receipt = await tx.wait()

    const poolID = ethers.BigNumber.from(await _dpm.MasterChef?.poolLength() - 1)
    const _amount = _bal.div(ethers.BigNumber.from(2))
    tx = await _pair0.connect(provider1()).approve(_dpm.MasterChef?.address, _amount)
    receipt = await tx.wait()
    const _allowance = await _pair0.allowance(provider1().getAddress() ,_dpm.MasterChef?.address)
    expect(_allowance).equals(_amount.toString())
    // FLOW staking LP
    tx = await _dpm.MasterChef?.connect(provider1()).deposit(poolID ,_amount)
    receipt = await tx.wait()

    const _bal2 = await _pair0.balanceOf(provider1().getAddress())
    expect(_bal2.toString()).equals(_amount.toString())

    // FLOW spend time
    printBlockCount("spend time... (blockheigh :10)")
    await spendBlockHeight(10);
    printBlockCount("")
    // FLOW withdraw

    const _pendingCake = await _dpm.MasterChef?.pendingCake(poolID, provider1().getAddress())
    console.log(`pendingCake : ${_pendingCake.toString()}`)
    // 혹시  0번 풀인 cakepool을 먼저 만들어놔야 동작하는 구조는 아닐까? 
    tx = await _dpm.MasterChef?.connect(provider1()).withdraw(poolID , 0)
    receipt = await tx.wait()
    
    const _balCake = await _dpm.Cake?.balanceOf(provider1().getAddress())
    console.log(`earned amount : ${_balCake.toString()}`)
    expect(_allocPoint.toString()).equal(_balCake.toString())
  })

  // -comment-   __    __  _ __   __   __    ___   ___    /7    __    __  _ __   __   __    ___   ___    /7    __    __  _ __   __   __    ___   ___    /7
  // -comment-  /  \  / / /// /  / /  /  \  / _/  / o |  //    /  \  / / /// /  / /  /  \  / _/  / o |  //    /  \  / / /// /  / /  /  \  / _/  / o |  // 
  // -comment- / o | / / | V /  / /  / o | / _/  /  ,'        / o | / / | V /  / /  / o | / _/  /  ,'        / o | / / | V /  / /  / o | / _/  /  ,'      
  // -comment-/__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()    /__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()    /__,' /_/  |_,'  /_/  /__,' /___/ /_/`_\ ()   


  it.skip(TitleEx("\t  ⬆⬆🔼addLiquidity Ex"), async () => {
    Title("Addliquidity>")
    const _amount = ethers.BigNumber.from(10).mul(decimal).add(ethers.BigNumber.from(1000));
    let tx = await _dpm.TokenE?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount)
    await tx.wait()

    const _amount2 = ethers.BigNumber.from(20).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenF?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount2)
    await tx.wait()
    await printBlockCount("start")

    // FLOW  first liquidity providing
    const [sentAmountTokenE, sentAmountTokenF, amountLP] = await _dpm.PancakeRouter?.connect(_signers[1]).callStatic.addLiquidity(
      _dpm.TokenE?.address,
      _dpm.TokenF?.address,
      _amount,
      _amount2,
      _amount,
      _amount2,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )
    await printBlockCount(`sentAmount(A: ${sentAmountTokenE.toString()} / B: ${sentAmountTokenF.toString()}) , Recieved LP Amount: ${amountLP.toString()}`)

    tx = await _dpm.PancakeRouter?.connect(_signers[1]).addLiquidity(
      _dpm.TokenE?.address,
      _dpm.TokenF?.address,
      _amount,
      _amount2,
      _amount,
      _amount2,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )
    receipt = await tx.wait()

    const _pair0Address = await _dpm.PancakeFactory?.getPair(_dpm.TokenE?.address, _dpm.TokenF?.address)
    const _pair0 = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _pair0Address)

    let _bal = await _pair0.balanceOf(provider1().getAddress())
    let [amountA, amountB, timestamp] = await _pair0.getReserves()
    Log(`LP contract's reserved tokens
amountA :${amountA}
amountB: ${amountB}
timestamp : ${timestamp}
    `)

    // FLOW second providing, Reserved token amount is not 0(pair contract)
    _bal = await _pair0.balanceOf(provider1().getAddress())
    const _amount3 = ethers.BigNumber.from(20).mul(decimal).add(ethers.BigNumber.from(1000));
    const _amount3Min = ethers.BigNumber.from(1).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenE?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount3)
    await tx.wait()

    const _amount4 = ethers.BigNumber.from(40).mul(decimal).add(ethers.BigNumber.from(1000));
    const _amount4Min = ethers.BigNumber.from(1).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenF?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount4)
    await tx.wait()
    await printBlockCount("start")

    await printBlockCount(`excute addLiquidity, and result: Provider1's LP balance : ${numberWithCommas(_bal.toString())}`)
    TraceLogs(receipt)
    tx = await _dpm.PancakeRouter?.connect(_signers[1]).addLiquidity(
      _dpm.TokenE?.address,
      _dpm.TokenF?.address,
      _amount3,
      _amount4,
      _amount3Min,
      _amount4Min,
      await provider1().getAddress(),
      new Date().getTime() + 5000
    )
    receipt = await tx.wait()


    _bal = await _pair0.balanceOf(provider1().getAddress())
    let [amountA2, amountB2, timestamp2] = await _pair0.getReserves()
    Log(`LP contract's reserved tokens
amountA2:${amountA2}
amountB2: ${amountB2}
timestamp2 : ${timestamp2}
    `)

    await printBlockCount(`excute addLiquidity, and result: Provider1's LP balance : ${numberWithCommas(_bal.toString())}`)
    TraceLogs(receipt)


    // FLOW third providing(provider2), Reserved token amount is not 0(pair contract)

    const _amount5 = ethers.BigNumber.from(10).mul(decimal).add(ethers.BigNumber.from(1000));
    const _amount5Min = ethers.BigNumber.from(1).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenE?.connect(provider2()).approve(_dpm.PancakeRouter?.address, _amount3)
    await tx.wait()

    const _amount6 = ethers.BigNumber.from(20).mul(decimal).add(ethers.BigNumber.from(1000));
    const _amount6Min = ethers.BigNumber.from(1).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenF?.connect(provider2()).approve(_dpm.PancakeRouter?.address, _amount4)
    await tx.wait()
    await printBlockCount("start")
    _bal = await _pair0.balanceOf(provider2().getAddress())
    await printBlockCount(`excute addLiquidity, and result: Provider2's LP balance : ${numberWithCommas(_bal.toString())}`)
    TraceLogs(receipt)
    tx = await _dpm.PancakeRouter?.connect(provider2()).addLiquidity(
      _dpm.TokenE?.address,
      _dpm.TokenF?.address,
      _amount5,
      _amount6,
      _amount5Min,
      _amount6Min,
      await provider2().getAddress(),
      new Date().getTime() + 5000
    )
    receipt = await tx.wait()

    _bal = await _pair0.balanceOf(provider2().getAddress())
    let [amountA3, amountB3, timestamp3] = await _pair0.getReserves()
    Log(`LP contract's reserved tokens
amountA3:${amountA3}
amountB3: ${amountB3}
timestamp3 : ${timestamp3}
    `)
    await printBlockCount(`excute addLiquidity, and result: Provider2's LP balance : ${numberWithCommas(_bal.toString())}`)
    const _ts = await _pair0.totalSupply()
    console.log(`pair0's totalsupply`, _ts.toString())

  })
})



