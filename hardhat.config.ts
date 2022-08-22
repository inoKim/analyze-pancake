require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ganache");
import { task } from "hardhat/config";
require("dotenv").config()

import { version } from "os";
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          }
      }
     },
      { version: "0.5.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    } },
      { version: "0.5.16",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    } },
      { version: "0.6.0" ,
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    }},
      { version: "0.6.6" ,
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    }},
      { version: "0.6.12",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    } },
      { version: "0.8.0" ,
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    }},
      { version: "0.8.1" ,
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    }},
      { version: "0.8.3" ,
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    }},
      { version: "0.8.4" ,
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
    }},
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      // mining:{
      //   auto: false,
      //   interval: [1000, 3000],
      // }
    },
    ground_dev: {
      url: `https://dex-mvp.dev.kstadium.io:18545`,
      accounts: [
        process.env.KSTARDIUM_OWNER_PK,
        process.env.KSTARDIUM_USER1_PK,
        process.env.KSTARDIUM_USER2_PK,
      ],
      chainId: 6133342113419,
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/e2b43a45aab34ecdba581423d92fda49",
      accounts: [
        process.env.OWNER,
        process.env.USER1,
        process.env.USER2,
      ],
      chainId: 4,
    },
    /*
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [
        process.env.OWNER,
        process.env.USER1,
        process.env.USER2,
      ],
      chainId: 3,
    },
    zodium: {
      url: "http://ec2-3-36-46-89.ap-northeast-2.compute.amazonaws.com:8545",
      accounts: [
        process.env.OWNER_ZODIRPC,
        process.env.USER1_ZODIRPC,
        process.env.USER2_ZODIRPC,
      ],
      gasPrice: 40000000000,
    },
    bsc: {
      url: "https://bsc-dataseed1.ninicoin.io",
      accounts: [
        process.env.OWNER_ZODIRPC,
        process.env.USER1_ZODIRPC,
        process.env.USER2_ZODIRPC,
      ],
    },
    */
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [
        process.env.OWNER,
        process.env.USER1,
        process.env.USER2,
      ],
    },
  },
};
