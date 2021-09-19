pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract SolidityMart {

    uint total_listings = 0;
    uint unavailable_listings = 0;

    event NewListing(uint listingId, string name, string description, uint price, address seller);
    event SaleInitiated(uint listingId, string buyer_public_possible);
    event ItemTransferred(uint listingId, string encrypted_item);
    event FundsReleased(uint listingId);

    struct Listing {
        uint listing_id;
        string name;
        string description;
        uint price;
        address payable seller;
        bool available;
    }

    Listing[] public listings;

    function createListing(string memory _name, string memory _description, uint _price) public {
        require(_price>=0, "Price should be non-negative");
        uint id = total_listings;
        listings.push(Listing(id, _name, _description, _price, msg.sender, true));
        total_listings++;
        emit NewListing(id, _name, _description, _price, msg.sender);
    }

    function listItems() public view returns (Listing[] memory) {
        Listing[] memory _available = new Listing[](total_listings - unavailable_listings);
        uint k = 0;
        for (uint i=0;i<total_listings;i++){
            if(listings[i].available){
                _available[k] = listings[i];
                k++;
            }
        }
        return _available;
    }

    // To be called by buyer to initiate the sale.
    // Buyer is expected to share his/her public key.
    function initiateSale(uint _id, string memory _buyer_public_key) public payable {
        require(msg.value == listings[_id].price, "Payment value not equal");
        require(listings[_id].available, "Item not available");

        listings[_id].available = false;
        unavailable_listings++;
        emit SaleInitiated(_id, _buyer_public_key);
    }

    // To be called by seller after hearing SaleInitiated event.
    // Seller will encrypt item using buyers public key and call this to get funds.
    function transferItem(uint _id, string memory _encrypted_item) public {
        require(listings[_id].seller == msg.sender, "Can only be called by seller");
        emit ItemTransferred(_id, _encrypted_item);
    }

    // To be called by the buyer after hearing ItemTransferred event.
    // Buyer will confirm that item received is correct and release funds to seller.
    function releaseFunds(uint _id) public {
        address payable _seller = listings[_id].seller;
        _seller.transfer(listings[_id].price);
        emit FundsReleased(_id);
    }
}
