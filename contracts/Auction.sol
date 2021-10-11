pragma solidity >=0.7.0 <0.9.0;

/* Auction strats:
    0: First Price Sealed-Bid Auction
    1: Second Price Sealed-Bid Auction
    2: Average Price Sealed-Bid Auction
*/

contract Factory{
    Auction[] public auctions;

    event AuctionCreated(address autionAddress, string name, uint _strat);
    
    function createAuction(string memory _name, uint _basePrice, uint _bidDuration, uint _revealDuration, uint _strat) external {
       Auction auction = new Auction(auctions.length, _name, _basePrice, _bidDuration, _revealDuration, _strat);
       auctions.push(auction);
       emit AuctionCreated(address(auction), _name, _strat);
     }
}

contract Auction { 
    uint public index;
    
    address payable seller;
    uint strat;
    string public name;
    uint public basePrice;
    uint public bidEnd;
    uint public revealEnd;
    uint public maxBid;
    uint public secmaxBid;
    uint public winAmount;
    address public winner;


    mapping(address => uint) public balances;
    mapping(address => bytes32) public hashedBids;
    
    event ClaimInitiated(string _public_key);
    event ItemTransferred(string _encrypted_item);
    
    constructor (uint _index, string memory _name, uint _basePrice, uint _bidDuration, uint _revealDuration, uint _strat) {
        index = _index;
        name = _name;
        strat = _strat;
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
    
    function reveal(uint amount) public {
        require(block.timestamp >= bidEnd, "Revealing period is yet to start");
        require(block.timestamp < revealEnd, "Revealing period has expired");
        require(keccak256(abi.encodePacked(amount)) == hashedBids[msg.sender]); //sha3
        require(amount >= basePrice, "Bid should not be less than base price");
        require(amount <= balances[msg.sender], "Bid less than deposit amount");
    
        if(strat == 0){
            if(amount > maxBid){
                balances[winner] += maxBid;
                maxBid = amount;
                winAmount = amount;
                winner = msg.sender;
                balances[winner] -= amount;
            }
        }
        else if(strat == 1){
            balances[winner] += winAmount;
            if(amount >= maxBid){
                secmaxBid = maxBid;
                maxBid = amount;
                winner = msg.sender;
            }
            if(amount >= secmaxBid){
                secmaxBid = amount;
            }
            winAmount = secmaxBid;
            balances[winner] -= winAmount;
        }
    }
    
    function withdraw() public {
        require(block.timestamp >= revealEnd, "Revealing period is yet to expire");
        uint amount = balances[msg.sender];
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
        seller.transfer(winAmount);
        emit ItemTransferred(_encrypted_item);
    }
}

