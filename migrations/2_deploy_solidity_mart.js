var SolidityMart = artifacts.require("SolidityMart");
var Listing = artifacts.require("Listing");
var Auction = artifacts.require("Auction");

module.exports = function(deployer){
  deployer.deploy(SolidityMart);
  deployer.deploy(Listing, "Dummy", "This is a dummy listing", 42069);
  deployer.deploy(Auction, "Dummy", 100, 5, 5, 0);
}