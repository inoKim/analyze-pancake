import { ethers } from "hardhat";
import { Signer } from "ethers";

import * as deployment from "../scripts/deploy";
import { IBucket } from "../scripts/deploy";
import { Token } from "../libs/account";
import clc from "cli-color"

import CashFlow from "../libs/account"

import { Title, Deploy, Notice, Log, TitleEx } from "../libs/logger"
import hre from "hardhat";
import { TraceLogs } from "../libs/events"
import { numberWithCommas } from "../libs/common";


const decimal = ethers.BigNumber.from(10).pow(18)
let tx, receipt
describe(TitleEx("Pancakeswap workflow ->"), () => {

  let _signers: Signer[];
  let _dpm: IBucket;

  const flowMonitor: CashFlow = new CashFlow()
  const owner = () => _signers[0]
  const provider1 = () => _signers[1]
  const provider2 = () => _signers[2]
  const operator1 = () => _signers[_signers.length - 2]
  const operator2 = () => _signers[_signers.length - 1]

  const printBlockCount = async (msg: string = "") => {
    Log("> " + `block height(${await ethers.provider.getBlockNumber()})| ${msg}`)
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
    { // -flow- providing Liquidity TokenA&B
      Title("Addliquidity(TokenA & TokenB)>")

      await printBlockCount("Remove Liquidity(TokenA &TokenB)")
      const _p = await _dpm.PancakeFactory?.getPair(_dpm.TokenA?.address, _dpm.TokenB?.address)
      if (_p !== '0x0000000000000000000000000000000000000000') {
        console.log(`paircontract address : ${_p}`)
        const _pairContract = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _p)
        const _currentBalance = await _pairContract.balanceOf(provider1().getAddress())
        console.log('current balance :', _currentBalance.toString())
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
        console.log(`totalSUpply :${await _pairContract.totalSupply()}`)
      } else {
        Log("there is no provided LP.")
      }

      const _amount = ethers.BigNumber.from(10).mul(decimal).add(ethers.BigNumber.from(1000));
      tx = await _dpm.TokenA?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount)
      await tx.wait()

      const _amount2 = ethers.BigNumber.from(10).mul(decimal).add(ethers.BigNumber.from(1000));
      tx = await _dpm.TokenB?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount2)
      await tx.wait()

      await printBlockCount(`Refresh LP TokenA(${_amount.toString()}) , TokenB(${_amount2.toString()})`)
      const [sentAmountTokenA, sentAmountTokenB, amountLP] = await _dpm.PancakeRouter?.connect(_signers[1]).callStatic.addLiquidity(
        _dpm.TokenA?.address,
        _dpm.TokenB?.address,
        _amount,
        _amount2,
        0, 0,
        await provider1().getAddress(),
        new Date().getTime() + 50000
      )

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

      await printBlockCount(`sentAmount(A: ${sentAmountTokenA.toString()} / B: ${sentAmountTokenB.toString()}) , Recieved LP Amount: ${amountLP.toString()}`)
      const _pair0Address = await _dpm.PancakeFactory?.getPair(_dpm.TokenA?.address, _dpm.TokenB?.address)
      const _pair0 = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _pair0Address)

      let _bal = await _pair0.balanceOf(provider1().getAddress())
      let [amountA, amountB, timestamp] = await _pair0.getReserves()
      Log(`LP contract's reserved tokens
amountA :${amountA}
amountB: ${amountB}
timestamp : ${timestamp}
    `)
    }
    { // -flow- providing Liquidity TokenC&D 

      Title("Addliquidity (TokenC & TokenD)>")

      await printBlockCount("Remove Liquidity TokenC & TokenD")
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

      await printBlockCount(`Refresh LP TokenC(${_amount.toString()}) , TokenD(${_amount2.toString()})`)
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

      await printBlockCount(`sentAmount(C: ${sentAmountTokenC.toString()} / D: ${sentAmountTokenD.toString()}) , Recieved LP Amount: ${amountLP.toString()}`)
      const _pair0Address = await _dpm.PancakeFactory?.getPair(_dpm.TokenC?.address, _dpm.TokenD?.address)
      const _pair0 = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _pair0Address)

      let _bal = await _pair0.balanceOf(provider1().getAddress())
      let [amountC, amountD, timestamp] = await _pair0.getReserves()
      Log(`LP contract's reserved tokens
  amountC :${amountC}
  amountD: ${amountD}
  timestamp : ${timestamp}
      `)
    }

  })


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


  it.skip(TitleEx("\t  ⬆⬆🔼addLiquidity Ex"), async () => {
    Title("Addliquidity>")
    const _amount = ethers.BigNumber.from(10).mul(decimal).add(ethers.BigNumber.from(1000));
    let tx = await _dpm.TokenE?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount)
    await tx.wait()

    const _amount2 = ethers.BigNumber.from(20).mul(decimal).add(ethers.BigNumber.from(1000));
    tx = await _dpm.TokenF?.connect(provider1()).approve(_dpm.PancakeRouter?.address, _amount2)
    await tx.wait()
    await printBlockCount("start")

    // -flow-  first liquidity providing
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

    // -flow- second providing, Reserved token amount is not 0(pair contract)
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


    // -flow- third providing(provider2), Reserved token amount is not 0(pair contract)

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

