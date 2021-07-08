var MyFlashLoan_V2 = artifacts.require("MyFlashLoan_V2");


module.exports = function(deployer, network) {
 
  var LendingPoolProvider_address = "0x88757f2f99175387aB4C6a4b3067c77A695b0349";

  if(network == "mainnet"){
  	LendingPoolProvider_address = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
  }

  deployer.deploy(MyFlashLoan_V2, LendingPoolProvider_address);
};
