pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;


/**
 * @title SolidityMart
 * @author Akshat Chajjer, Shivansh Seth, Istasis Mishra
 * @dev A smart contract to create listings, view available listings and buy the products
 */
contract SolidityMart {
    uint total_listings; ///< total number of listings made through the contract
    uint unavailable_listings; ///< number of listings which have already been sold
    /**
     * @dev Constructor for the contract. Inits total_listings and unavailable_listings to 0
     */
    constructor() public payable{
        total_listings = 0;
        unavailable_listings = 0;
    }
    
    event NewListing(uint listingId, string name, string description, uint price, address seller); 
    event SaleInitiated(uint listingId, string buyer_public_possible); ///< Event alerting the buyer about a valid buy request
    event ItemTransferred(uint listingId, string encrypted_item); //</ Event denoting that the item has been delivered to buyer
    event FundsReleased(uint listingId); ///< Event denoting that funds have been transferred to seller
    
    /*! Struct for storing all the data related to a listing */
    struct Listing {
        uint listing_id;
        string name;
        string description;
        uint price;
        address seller;
        bool available;
    }

    Listing[] listings; ///< Array to store all listings made through the contract 

    /**
     * @dev Creates a listing with provided information
     * @param _name Name of the the listed item (not same as the item string)
     * @param _description A brief description of the item 
     * @param _price The asking price for the item as decided by the buyer
    */
    function createListing(string memory _name, string memory _description, uint _price) public {
        require(_price>=0, "Price should be non-negative");
        uint id = total_listings;
        listings.push(Listing(id, _name, _description, _price, msg.sender, true));
        total_listings++;
        emit NewListing(id, _name, _description, _price, msg.sender);
    }
    
    /**
     * @dev Returns the list of all available listings
     * @return Listing[] 
    */
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

    /**
     * @dev Payable to be called by buyer to initiate the sale. Emits SaleInitiated() to alert the buyer, if the listing is available and the value matches asking price
     * @param _id ID of the listing to be bought
     * @param _buyer_public_key Public key corresponding to the buyers private key. This key will be used by the seller to encrypt the item string before transfer. The encryption algorithm has to be decided beforehand (Test cases use RSA)
    */
    function initiateSale(uint _id, string memory _buyer_public_key) public payable{
        require(_id < total_listings, "Invalid ID");
        require(listings[_id].available, "Item not available");
        require(msg.value == listings[_id].price, "Payment value not equal");

        listings[_id].available = false;
        unavailable_listings++;
        emit SaleInitiated(_id, _buyer_public_key);
    }

    /**
     * @dev To be called by seller on hearing a SaleInitiated() event. Emits a ItemTransferred() event which provides the encrypted string to the buyer (or anyone else listening)
     * @param _id ID of the item to be transferred
     * @param _encrypted_item Item string encrypted with the public key of the buyer
     */
    function transferItem(uint _id, string memory _encrypted_item) public {
        require(!listings[_id].available, "Item not sold yet");
        require(listings[_id].seller == msg.sender, "Can only be called by seller");
        emit ItemTransferred(_id, _encrypted_item);
    }

    /**
     * @dev To be called by buyer on hearing a ItemTransferred() event to confirm that item received is correct and release funds to seller.
     * @param _id ID of the item sold
     */
    function releaseFunds(uint _id) public {
        address payable _seller = payable(listings[_id].seller);
        _seller.transfer(listings[_id].price);
        emit FundsReleased(_id);
    }
}
