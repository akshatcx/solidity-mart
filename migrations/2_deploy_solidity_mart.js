var SolidityMart = artifacts.require("SolidityMart");
var Listing = artifacts.require("Listing");
var web3 = require('web3')

module.exports = function(deployer){
  deployer.deploy(SolidityMart);
}