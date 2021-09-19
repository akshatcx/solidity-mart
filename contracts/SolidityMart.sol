pragma solidity ^0.4.0;

contract SolidityMart {

    uint total_listings = 0;
    event NewListing(uint listingId, string name, string description, uint price, address seller);
    event SellItem(uint listingId, address newOwner);

    struct Listing {
        uint listing_id;
        string name;
        string description;
        uint price;
        address seller;
        bool sold;
    }

    mapping (uint => string) listingToItem;
    mapping (uint => Listing) public listings;

    function createListing(string memory _name, string memory _description, uint _price, string memory _item) public {
        require(_price>=0, "Price should be non-negative");
        id = total_listings;
        listings[id] = Listing(id, _name, _description, _price, msg.sender, false);
        listingToItem[id] = _item;
        total_listings++;
        emit NewListing(id, _name, _description, _price, msg.sender);
    }

    function listItems() public view returns (Listing[] memory) {
        Listing[] _unsold;
        for (uint i=0;i<total_listings;i++){
            if(!listings[i].sold){
                _unsold.push(listings[i]);
            }
        }
        return _unsold;
    }

    function buyItem(uint _id) public payable {
        require(msg.value >= listings[_id].price, "Value not enough");
        require(!listings[_id].sold, "Item not available");

        address payable _seller = products[_id].seller;
        listings[_id].sold = true;
        listings[_id].seller = msg.sender;

        emit SellItem(_id, msg.sender);
        _seller.transfer(msg.value);
    }

}