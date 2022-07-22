import { Interface, _toEscapedUtf8String } from "ethers/lib/utils"
import { ethers } from "hardhat"
import hre from "hardhat";
import clc from "cli-color";

let eventABIs: string[] = []
const contractList = [
  "PancakeFactory",
  "PancakeRouter",
  "PancakePair",
  "MasterChef",
  "MasterChefV2"
]
const contracts = []
let _parserInterface:Interface
const InitEventsInterfaces = (): Interface => {
  if (eventABIs.length === 0) {
    contractList.map((item) => {
      const abis = hre.artifacts.readArtifactSync(item).abi
      abis.forEach((_con) => {
        if (_con["type"] === "event") {
          eventABIs.push(_con)
        }
      })
    })
    _parserInterface = new ethers.utils.Interface(eventABIs)
  }
  return _parserInterface
}

const TraceLogs = (_receipt: any): string[] => {
  const iface = InitEventsInterfaces()
  const _history = _receipt.events.map((_log:any) =>{
    const _c = iface.parseLog({topics: _log.topics, data: _log.data})
    return _c.name + `(${_c.args})`
    
  })


  console.log(clc.bgBlueBright.black.bold("event history ...                                         "))
  _history.forEach((_item:string, _idx: number) =>{
    console.log("["+_idx + "] "+ _item)
  })
  console.log(clc.bgBlueBright.black.bold("                                                           "))
  return _history
}

InitEventsInterfaces()


export { TraceLogs }