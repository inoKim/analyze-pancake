import { ethers } from "hardhat";

import { Title, Deploy, Notice, Log, TitleEx } from "../libs/logger"
import { TraceLogs } from "../libs/events"
import { numberWithCommas, printBlockCount, spendBlockHeight } from "../libs/common";
import {getTokenContractByAddress} from "./common";

import {commonDeploy, commonBeforeEach , provider1, provider2, owner, operator1, operator2, _dpm, loadEnvs } from "./common"
import { expect } from "chai";

const decimal = ethers.BigNumber.from(10).pow(18)
let tx, receipt



describe(TitleEx("Pancakeswap workflow ->"), function(){
  loadEnvs()
  this.timeout(3* 60 * 1000);
  before(async () => { await commonDeploy() })
  beforeEach(async () => { await commonBeforeEach()})


  it(TitleEx("END OF deposit to MasterchefV2"), async () => {

    Title("deposit to MasterchefV2")
    let before: any
    const _lpAddress = await _dpm.PancakeFactory?.getPair(_dpm.TokenA?.address, _dpm.TokenB?.address)
    const _lp = await getTokenContractByAddress(_lpAddress)

    const _mcv2 = _dpm.MasterChefV2

    const _allocPoint = ethers.BigNumber.from(1).mul(decimal)

    Log(`provider1's LP(TokenA & TokenB) balance :${ (await _lp.balanceOf(provider1().getAddress())).toString()}`)

    //FLOW  Adding a new pool for staking
    before = (await _mcv2?.poolLength())
    tx = await _mcv2?.add(_allocPoint, _lpAddress, true, true)
    receipt = await tx.wait()
    TraceLogs(receipt, "MasterchefV2.add()");

    expect(Number(before)+1).equals(await _mcv2?.poolLength())
    printBlockCount("...")
    await spendBlockHeight(10)
    printBlockCount("wating for spend blockheight..")

    //FLOW deposit 
    const _bal = await _lp.balanceOf(provider1().getAddress())
    tx = await _lp?.connect(provider1()).approve(_mcv2?.address, _bal)
    receipt = await tx.wait()

    tx = await _mcv2?.connect(provider1()).deposit(0,_bal)
    receipt = await tx.wait()
    TraceLogs(receipt, "_mcv2.deposit")

    //FLOW Spend block heights
    await spendBlockHeight(1)

    //FLOW Withdraw
    let _pendingCake = await _mcv2?.pendingCake(0, provider1().getAddress())
    await printBlockCount(`provider1's pending cake amount : ${ethers.utils.formatUnits(_pendingCake)}`)
    let _balCake = await _dpm.Cake?.balanceOf(provider1().getAddress())
    expect(_balCake.toString()).equal("0")
    tx = await _mcv2?.connect(provider1()).withdraw(0, 0)
    receipt = await tx.wait()

    TraceLogs(receipt ,"_mcv2.withdraw")
    _balCake = await _dpm.Cake?.balanceOf(provider1().getAddress())
    await printBlockCount(`erned balance :${ethers.utils.formatUnits(_balCake)}`)
    
  }) 

})