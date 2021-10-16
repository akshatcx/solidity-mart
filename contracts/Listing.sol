pragma solidity >=0.4.0 <0.9.0;

/**
 * @title Listing
 * @author Akshat Chhajer, Shivansh Seth, Istasis Mishra
  * @dev A smart contract to create and manage a single listing
 */
contract Listing {
    enum State {
        LISTED,
        INITIATED,
        RECEIVED,
        SOLD
    }
    
    string name;
    string description;
    uint price;
    address seller;
    string buyer_public_key;
    string encrypted_item;
    State state;

    /**
     * @dev Constructor for the contract. Creates a new listing
     * @param _name Name of the the listed item (not same as the item string)
     * @param _description A brief description of the item 
     * @param _price The asking price for the item as decided by the buyer
     * @param sender Address of the person creating the listing
     */
    constructor(string memory _name, string memory _description, uint _price, address sender) public {
        require(_price>=0, "Price should be non-negative");
        name = _name;
        description = _description;
        price = _price;
        seller = address(uint160(sender));
        state = State.LISTED;
    }

    /**
     * @dev Get a summary of the listing
     * @return string, string, uint address, string, string. State 
    */
    function getSummary() public view returns (string memory, string memory, uint, address, string memory , string memory, State){
        return (name, description, price, seller, buyer_public_key, encrypted_item, state);
    } 

    /**
     * @dev Payable to be called by buyer to initiate the sale. Emits SaleInitiated() to alert the buyer, if the listing is available and the value matches asking price
     * @param _buyer_public_key Public key corresponding to the buyers private key. This key will be used by the seller to encrypt the item string before transfer. The encryption algorithm has to be decided beforehand (Test cases use RSA)
    */
    function initiateSale(string memory _buyer_public_key) public payable{
        require(state == State.LISTED, "Item not available");
        require(msg.value == price, "Incorrect payment value");
        buyer_public_key = _buyer_public_key;
        state = State.INITIATED;
    }

    /**
     * @dev To be called by the seller to get buyer's public key.
     * @return string
    */
    function getBuyerKey() public view returns (string memory) {
        require(msg.sender == seller, "Can only be called by seller");
        // require(state == State.INITIATED,"Sale not yet INITIATED");
        return buyer_public_key;
    }

    /**
     * @dev To be called by seller on hearing a SaleInitiated() event. Emits a ItemTransferred() event which provides the encrypted string to the buyer (or anyone else listening)
     * @param _encrypted_item Item string encrypted with the public key of the buyer
     */
    function transferItem(string memory _encrypted_item) public {
        require(msg.sender == seller, "Can only be called by seller");
        require(state == State.INITIATED, "Sale not yet RECEIVED by seller");
        encrypted_item = _encrypted_item;

        address payable payable_seller = address(uint160(seller));
        payable_seller.transfer(price);    
        state = State.SOLD;
    }

    /**
     * @dev To be called by buyer to receive the encypted item
     * @return string
     */
    function getItem() public view returns (string memory) {
        require(state == State.SOLD, "Item not yet transferred by seller");
        return encrypted_item;
    }
}