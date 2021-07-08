const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const resultEnv = require('dotenv').config({path: 'EnvVar.env'});
const PrivateKey = process.env.Private_Key;
const InfuraId = process.env.Infura_Id;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
    	host: "localhost",
      	port: 8545,
      	network_id: 42
    },


    mainnet: {
    provider: () => new HDWalletProvider(PrivateKey, "https://mainnet.infura.io/v3/"+InfuraId),
    network_id: 1,       // Mainnet's id
    gas: 7000405 ,    
    gasPrice: 44000000000,
    //confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    //timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    //skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    }, 


    kovan: {
    provider: () => new HDWalletProvider(PrivateKey, "https://kovan.infura.io/v3/"+InfuraId),
    network_id: 42,       // Ropsten's id
    gas: 7000405 ,    
    gasPrice: 44000000000,
    //confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    //timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    //skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    }, 
    
  },

  compilers: {
    solc: {
      version: "0.6.12",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solcolidity docs for advice about optimization and evmVersion
      optimizer: {
        enabled: false,
        runs: 200
      },
      //  evmVersion: "byzantium"
      // }
    },
  },
};
