pragma solidity ^0.4.0;

contract SolidityMart {

    uint total_listings = 0;
    event NewListing(uint listingId, string name, string description, uint price, address seller);
    event SaleInitiated(uint listingId, string buyer_public_possible);
    event ItemTransferred(uint listingId, string encrypted_item);

    struct Listing {
        uint listing_id;
        string name;
        string description;
        uint price;
        address seller;
        bool available;
    }

    Listing[] public listings;

    function createListing(string memory _name, string memory _description, uint _price, string memory _item) public {
        require(_price>=0, "Price should be non-negative");
        id = total_listings;
        listings.push(Listing(id, _name, _description, _price, msg.sender, true));
        total_listings++;
        emit NewListing(id, _name, _description, _price, msg.sender);
    }

    function listItems() public view returns (Listing[] memory) {
        Listing[] _available;
        for (uint i=0;i<total_listings;i++){
            if(listings[i].available){
                _available.push(listings[i]);
            }
        }
        return _unsold;
    }

    // To be called by buyer to initiate the sale.
    // Buyer is expected to share his/her public key.
    function initiateSale(uint _id, string memory _buyer_public_key) public payable {
        require(msg.value == listings[_id].price, "Payment value not equal");
        require(listings[_id].available, "Item not available");

        listings[_id].available = false;
        emit SaleInitiated(_id, _buyer_public_key);
    }

    // To be called by seller after hearing SaleInitiated event.
    // Seller will encrypt item using buyers public key and call this to get funds.
    function transferItem(uint _id, string memory _encrypted_item) public {
        require(listings[_id].seller == msg.sender, "Can only be called by seller");
        require(buyer_keys[_id], "Sale not yet initiated");

        listings[_id].seller.transfer(listings[_id].price);
        emit ItemTransferred(_id, _encrypted_item);
    }

}