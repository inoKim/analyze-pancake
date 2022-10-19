import hre, { ethers } from "hardhat";

import { Title, Deploy, Notice, Log, TitleEx } from "../libs/logger"
import { TraceLogs } from "../libs/events"
import { numberWithCommas, printBlockCount, spendBlockHeight, getTxParam } from "../libs/common";
import { getTokenContractByAddress } from "./common";

import { commonDeploy, commonBeforeEach, _dpm, loadEnvs } from "./common"
import { expect } from "chai";

const decimal = ethers.BigNumber.from(10).pow(18)
let tx, receipt


describe(TitleEx("Find available gaslimit"), () => {



  const TokenAddresses = {
    // TokenA: "0x90dA0fD189A066CbC198537A330e9dC6296f2bDb",
    // TokenB: "0xAF5c1f5e641bee49f24D159ED88e5c4C8660acd1",
    TokenA: "0x99c976758509597E263F4149687C79A4996Dfa57",
    TokenB: "0x83846143Fb530511352A0c26C098397b72ABEBB3",
    Factory: "0x9058bf4f46ba1172237D587f97780635F631AdbE",
    Router: "0x54a4c8E120D58cEC55512eC6A97d89E501856191",
  }

  it.only(TitleEx("TransferTokens"), async() => {
    const [provider0, provider1, provider2] = await ethers.getSigners()

    const _to = ""
    const _tokenA = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("Token").abi, TokenAddresses.TokenA)
    const _tokenB = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("Token").abi, TokenAddresses.TokenB)

    let _tx = await _tokenA.connect(provider0).transfer("0xaBB9934781678B11D6526359eBda88c19188acD9",ethers.BigNumber.from(5000).mul(decimal) )
    let _receipt = await _tx.wait()

    TraceLogs(_receipt, "Simple transfer TokenA")
    _tx = await _tokenB.connect(provider0).transfer("0xaBB9934781678B11D6526359eBda88c19188acD9",ethers.BigNumber.from(5000).mul(decimal) )
    _receipt = await _tx.wait()

    TraceLogs(_receipt, "Simple transfer TokenB")
    
    await provider0.sendTransaction()

  })

  it(TitleEx("Discover available gaslimit"), async () => {


    const [_, provider1] = await ethers.getSigners()

    const _Router = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakeRouter").abi, TokenAddresses.Router)
    const _Factory = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakeFactory").abi, TokenAddresses.Factory)
    const _p = await _Factory.getPair(TokenAddresses.TokenA, TokenAddresses.TokenB)
    const _pairContract = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("PancakePair").abi, _p)

    const _tokenA = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("Token").abi, TokenAddresses.TokenA)
    const _tokenB = await hre.ethers.getContractAt(hre.artifacts.readArtifactSync("Token").abi, TokenAddresses.TokenB)

    const _amount = ethers.BigNumber.from(20).mul(decimal).add(ethers.BigNumber.from(1000));
    // tx = await _tokenA.connect(provider1).approve(TokenAddresses.Router, _amount, getTxParam(provider1))
    // await tx.wait()

    const _amount2 = ethers.BigNumber.from(30).mul(decimal).add(ethers.BigNumber.from(1000));
    // tx = await _tokenB.connect(provider1).approve(TokenAddresses.Router, _amount2, getTxParam(provider1))
    // await tx.wait()

    // const _gl = ethers.BigNumber.from(5).mul(ethers.BigNumber.from(10).pow(9))
    const _gl = 680000000
    console.log('had set up gaslimit : ', _gl)
    let _param = {
      ...getTxParam(provider1),
      gasLimit: _gl
    }
    /////////////////////

    console.log('provider :', await provider1.getAddress())
    console.log('1')
    console.log('tokenA address : ', _tokenA.address)
    console.log("TokeA balance : ", await _tokenA.balanceOf(await provider1.getAddress()))
    console.log(`approve TokenA :`, await _tokenA.allowance(provider1.getAddress(), _Router.address))
    console.log('tokenB address : ', _tokenB.address)
    console.log("TokeB balance : ", await _tokenB.balanceOf(await provider1.getAddress()))
    console.log(`approve TokenB :`, await _tokenB.allowance(provider1.getAddress(), _Router.address))
    console.log('pancakeRouter : ', _Router.address)
    console.log("amount:", _amount.toString())
    console.log("amount2:", _amount2.toString())
    console.log("providier : ", await provider1.getAddress())


    ///////////////////////////



    tx = await _Router.connect(provider1).addLiquidity(
      _tokenA.address,
      _tokenB.address,
      _amount,
      _amount2,
      0, 0,
      await provider1.getAddress(),
      new Date().getTime() + 50000,
      _param
    )
    receipt = await tx.wait()
  })
})

