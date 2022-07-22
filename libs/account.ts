import { ethers } from "hardhat"
import hre from "hardhat";
import Table from "cli-table3"
import { table } from "console"
import logger from "../libs/logger"

interface IOutliner {
  flatten(): string
}
interface IToken extends IOutliner {
  tokenAddress: string
  symbol: string
}
export class Token implements IToken {
  tokenAddress: string;
  symbol: string
  constructor(addr: string, smb: string) {
    this.tokenAddress = addr
    this.symbol = smb
  }
  public flatten(): string {
    const _t = new Table({
      head: ["symbol", "address"]
      , colWidths: [300, 500]
    })
    _t.push([this.symbol, this.tokenAddress],)
    return table.toString()
  }
}

interface IBalance extends IOutliner {
  token: Token
  wei: string
}
class Balance implements IBalance {
  public token: Token;
  public wei: string;

  constructor(_t: Token, _balance?: string) {
    this.token = _t;
    this.wei = _balance ?? "0";
  }
  public flatten(): string {
    const _t = new Table({
      head: ["symbol", "address", "balance"]
      , colWidths: [10, 40, 50]
    })
    _t.push([this.token.symbol, this.token.tokenAddress, numberWithCommas(this.wei)],)
    return _t.toString()
  }
}
interface balanceKit {
  owner: string
  balances: Balance[]
}
function numberWithCommas(num: string) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default class CashFlow {

  private tokenList: IToken[] = []
  private accountList: string[] = []
  private balanceAccumulator: IBalance[] = []


  async _watchNow(): Promise<string> {
    let ret = "";
    const _t = new Table({ head: ["SYMBOL", "TokenAddress", "balance", "variance"], })

    for( let i =0; i< this.accountList.length; i++){    
      const _b = await CashFlow.currentBalance(this.accountList[i])
      const _c = [_b.token.symbol, _b.token.tokenAddress, _b.wei,  ""]
      _t.push(_c) 
    }
    // console.log(`t :${_t.toString() }`)
    return _t.toString()
  }

  appendAccount(..._acc: string[]): void {
    for (let i = 0; i < _acc.length; i++) {
      let overlapped = false;
      for (let j = 0; j < this.accountList.length; j++) {
        if (_acc[i] == this.accountList[j]) {
          overlapped = !overlapped
          break;
        }
      }
      if (!overlapped) {
        this.accountList.push(_acc[i])
      }
    }
    // logger.Notice(`Added watching [[Accounts]] ${this.accountList[this.accountList.length-1]}`)
  }
  appendToken(..._tokens: IToken[]): void {
    for (let i = 0; i < _tokens.length; i++) {
      let overlapped = false;
      for (let j = 0; j < this.tokenList.length; j++) {
        if (_tokens[i].tokenAddress == this.tokenList[j].tokenAddress) {
          overlapped = !overlapped
          break;
        }
      }
      if (!overlapped) {
        this.tokenList.push(_tokens[i])
      }
    }
    // logger.Notice(`Added watching list[[TOKEN]] ${this.tokenList[this.tokenList.length-1]}`)
  }
  getTokens(): IToken[] {
    return this.tokenList
  }

  public static async currentBalance(_owner: string, _tokenInfo?: Token):Promise<Balance> {

    const _isToken = _tokenInfo ?? false

    if (_isToken) {
      const _token = await ethers.getContractAt((await hre.artifacts.readArtifact("WBNB")).abi, _tokenInfo!.tokenAddress)
      const _bal =  await _token.balanceOf(_owner)
      return new Balance(_tokenInfo!, _bal.toString())
      
    } else {
      const _b = await ethers.provider.getBalance(_owner)
      const _bal: Balance = new Balance(new Token("ETH", "0x00000000000000000000"), _b.toString())
      return _bal
    }
  }
}