pragma solidity >=0.7.0 <0.9.0;

contract Auction {
    address payable seller;
    string public name;
    uint256 public basePrice;
    uint256 public bidEnd;
    uint256 public revealEnd;
    uint256 public maxBid;
    address public winner;


    mapping(address => uint256) public balances;
    mapping(address => bytes32) public hashedBids;
    
    event ClaimInitiated(string _public_key);
    event ItemTransferred(string _encrypted_item);
    
    constructor (string memory _name, uint256 _basePrice, uint256 _bidDuration, uint256 _revealDuration ) {
        name = _name;
        basePrice = _basePrice;
        bidEnd = block.timestamp + _bidDuration;
        revealEnd = bidEnd + _revealDuration;
        seller = payable(msg.sender);
    }
    
    function bid(bytes32 hash) public payable {
        require(block.timestamp < bidEnd, "Bidding period has expired");
        require(hashedBids[msg.sender] == bytes32(0x0), "Only one bid per address allowed");
        require(msg.value >= basePrice, "Bid should not be less than base price");
        
        hashedBids[msg.sender] = hash;
        balances[msg.sender] += msg.value;
    }
    
    function reveal(uint256 amount) public {
        require(block.timestamp >= bidEnd, "Revealing period is yet to start");
        require(block.timestamp < revealEnd, "Revealing period has expired");
        require(keccak256(abi.encodePacked(amount)) == hashedBids[msg.sender]); //sha3
        require(amount >= basePrice, "Bid should not be less than base price");
        require(amount <= balances[msg.sender], "Bid less than deposit amount");

        if (amount > maxBid) {
            balances[winner] += maxBid;
            maxBid = amount;
            winner = msg.sender;
            balances[winner] -= amount;
        }
    }
    
    function withdraw() public {
        require(block.timestamp >= revealEnd, "Revealing period is yet to expire");
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    function initiateClaim(string memory _public_key) public {
        require(block.timestamp >= revealEnd, "Revealing period is yet to expire");
        require(msg.sender == winner, "Only callable by auction winner");
        emit ClaimInitiated(_public_key);
    }
    
    function transferItem(string memory _encrypted_item) public {
        require(block.timestamp >= revealEnd, "Revealing period is yet to expire");
        require(msg.sender == seller, "Only callable by seller");
        seller.transfer(maxBid);
        emit ItemTransferred(_encrypted_item);
    }
}
