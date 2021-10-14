pragma solidity >=0.4.0 <0.9.0;

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

    constructor(string memory _name, string memory _description, uint _price) public {
        require(_price>=0, "Price should be non-negative");
        name = _name;
        description = _description;
        price = _price;
        seller = address(uint160(msg.sender));
        state = State.LISTED;
    }

    function getSummary() public view returns (string memory, string memory, uint, address, string memory , string memory, State){
        return (name, description, price, seller, buyer_public_key, encrypted_item, state);
    } 

    function initiateSale(string memory _buyer_public_key) public payable{
        require(state == State.LISTED, "Item not available");
        require(msg.value == price, "Incorrect payment value");
        buyer_public_key = _buyer_public_key;
        state = State.INITIATED;
    }

    function getBuyerKey() public returns (string memory) {
        require(msg.sender == seller, "Can only be called by seller");
        require(state == State.INITIATED, "Sale not yet INITIATED");
        state = State.RECEIVED;
        return buyer_public_key;
    }

    function transferItem(string memory _encrypted_item) public {
        require(msg.sender == seller, "Can only be called by seller");
        require(state == State.RECEIVED, "Sale not yet RECEIVED by seller");
        encrypted_item = _encrypted_item;

        address payable payable_seller = address(uint160(seller));
        payable_seller.transfer(price);    
        state = State.SOLD;
    }

    function getItem() public view returns (string memory) {
        require(state == State.SOLD, "Item not yet transferred by seller");
        return encrypted_item;
    }
}