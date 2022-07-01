import { ethers } from "hardhat";
import { Signer } from "ethers";

import * as deployment  from "../scripts/deploy";
import {IBucket} from "../scripts/deploy";
import clc from "cli-color"

import CashFlow from "../libs/account" 

import l from "../libs/logger"

describe(l._Title("Pancakeswap workflow ->"), () => {

  let owner, user1, user2;
  let _dpm: IBucket;

  const flowMonitor:CashFlow = new CashFlow()


    it ("asdf",async () => {

      const [o,u1, u2] = await ethers.getSigners()
      owner = o
      user1 = u1
      user2 = u2

      flowMonitor.appendAccount(o.address, u1.address, u2.address)

      console.log(flowMonitor._watchNow())
       await deployment.deploying()
      _dpm = deployment.Contracts
    })

})
