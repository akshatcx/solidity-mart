pragma solidity >=0.4.0 <0.9.0;

import './Listing.sol';

/**
 * @title SolidityMart
 * @author Akshat Chhajer, Shivansh Seth, Istasis Mishra
 */
contract SolidityMart {
    uint total_listings; ///< total number of listings made through the contract
    address[] listings; ///< Array to store all listings made through the contract 

    function createListing(string memory _name, string memory _description, uint _price) public {
        Listing newListing = new Listing(_name, _description, _price);
        listings.push(address(newListing));
        total_listings++;
    }
    
    function getListings() public view returns (address[] memory) {
        return listings;
    }
}