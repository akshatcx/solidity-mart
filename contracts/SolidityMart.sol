pragma solidity >=0.4.0 <0.9.0;

import './Listing.sol';
import './Auction.sol';

/**
 * @title SolidityMart
 * @author Akshat Chhajer, Shivansh Seth, Istasis Mishra
  * @dev A [factory] smart contract to create and interact with listings and auctions
 */
contract SolidityMart {
    uint total_listings; ///< Total number of listings made through the contract
    uint total_auctions; ///< Total number of auctions made through the contract
    address[] listings; ///< Array to store all listings made through the contract 
    address[] auctions; ///< Arry to stotr all auctions made through the contract

    /**
     * @dev Constructor for the contract. Inits total_listings and total_auctions to 0
     */
    constructor() {
        total_listings = 0;
        total_auctions = 0;
    }
    
    /**
     * @dev Call the Listing contract to create a listing
     * @param _name Name of the the listed item (not same as the item string)
     * @param _description A brief description of the item 
     * @param _price The asking price for the item as decided by the buyer
    */
    function createListing(string memory _name, string memory _description, uint _price) public {
        Listing newListing = new Listing(_name, _description, _price, msg.sender);
        listings.push(address(newListing));
        total_listings++;
    }
    
    /**
     * @dev Returns the list of all listing addresses
     * @return address[] 
    */
    function getListings() public view returns (address[] memory) {
        return listings;
    }
    

    /**
     * @dev Call the Auction contract to create an auction
     * @param _name Name of the the listed item
     * @param _basePrice Base price of the item
     * @param _bidDuration Duration of the bid
     * @param _revealDuration Duration of the reveal period
     * @param _strat Auction strategy or format
    */ 
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
    /**
     * @dev Returns the list of all auction addresses
     * @return address[] 
    */ 
    function getAuctions() public view returns (address[] memory) {
        return auctions;
    }
}