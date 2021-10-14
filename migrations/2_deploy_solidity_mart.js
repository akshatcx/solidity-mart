var SolidityMart = artifacts.require("SolidityMart");
var Listing = artifacts.require("Listing");

module.exports = function(deployer){
  deployer.deploy(SolidityMart);
  deployer.deploy(Listing, "Dummy", "This is a dummy listing", 42069);
}