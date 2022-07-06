import "@nomiclabs/hardhat-waffle";
import {deploying} from "./deploy"

async function excute() {
   await deploying()
  
}
excute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
