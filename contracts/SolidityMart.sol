pragma solidity ^0.4.0;

contract SolidityMart {

    event NewListing(uint listingId, string name, string description, uint price);

    struct Listing {
        string name;
        string description;
        uint price;
    }

    Listing[] public listings;
}