pragma solidity >=0.4.0 <0.9.0;

import './Listing.sol';
import './Auction.sol';

/**
 * @title SolidityMart
 * @author Akshat Chhajer, Shivansh Seth, Istasis Mishra
 */
contract SolidityMart {
    uint total_listings; ///< total number of listings made through the contract
    uint total_auctions;
    address[] listings; ///< Array to store all listings made through the contract 
    address[] auctions;

    function createListing(string memory _name, string memory _description, uint _price) public {
        Listing newListing = new Listing(_name, _description, _price, msg.sender);
        listings.push(address(newListing));
        total_listings++;
    }
    
    function getListings() public view returns (address[] memory) {
        return listings;
    }
    

    /* Auction strats:
        0: First Price Sealed-Bid Auction
        1: Second Price Sealed-Bid Auction
        2: Average Price Sealed-Bid Auction
    */
    function createAuction(string memory _name, uint _basePrice, uint _bidDuration, uint _revealDuration, uint _strat) public {
        Auction newAuction = new Auction(_name, _basePrice, _bidDuration, _revealDuration, _strat, msg.sender);
        auctions.push(address(newAuction));
        total_auctions++;
    }
    
    function getAuctions() public view returns (address[] memory) {
        return listings;
    }
}