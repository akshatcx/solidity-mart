pragma solidity >=0.4.0 <0.9.0;

/* Auction strats:
    0: First Price Sealed-Bid Auction
    1: Second Price Sealed-Bid Auction
    2: Average Price Sealed-Bid Auction
*/

contract Auction { 
    struct Bid {
        bytes32 hashedBid;
        string public_key;
        uint value;
    }

    address seller;
    uint strat;
    string name;
    uint basePrice;
    uint bidEnd;
    uint public revealEnd;
    uint noBids;
    uint winAmount;
    address winner;
    string encrypted_item;
    uint auctionStart;
    uint bidDuration;
    uint revealDuration;
    mapping(address => uint) public balances;
    mapping(address => Bid) public addrToBid;
    uint public state; // 0 -> ongoing, 1 -> reveal period, 2 -> Over, 3 -> Ended, 4 -> transferred 
    address[] bidAddrs;
    

    constructor(string memory _name, uint _basePrice, uint _bidDuration, uint _revealDuration, uint _strat, address payable _seller) public {
        name = _name;
        strat = _strat;
        basePrice = _basePrice;
        auctionStart = block.timestamp;
        bidEnd = block.timestamp + _bidDuration;
        revealEnd = bidEnd + _revealDuration;
        seller = _seller;
        noBids = 0;
        bidDuration = _bidDuration;
        revealDuration = _revealDuration;
        winAmount = 0;    
    }

    function bid(bytes32 _hash, string memory _public_key) public payable {
        require(block.timestamp < bidEnd, "Bidding period has expired");
        require(addrToBid[msg.sender].hashedBid == bytes32(0x0), "Only one bid per address allowed");
        require(msg.value >= basePrice, "Bid should not be less than base price");

        addrToBid[msg.sender] = Bid(_hash, _public_key, 0);
        bidAddrs.push(msg.sender);
        balances[msg.sender] += msg.value;
        noBids++;
    }
    
    function reveal(uint _amount) public {
        require(block.timestamp >= bidEnd, "Revealing period is yet to start");
        require(block.timestamp < revealEnd, "Revealing period has expired");
        require(keccak256(abi.encodePacked(_amount)) == addrToBid[msg.sender].hashedBid, 'Hash not equal'); //sha3
        require(_amount >= basePrice, "Bid should not be less than base price");
        require(_amount <= balances[msg.sender], "Bid less than deposit amount");

        addrToBid[msg.sender].value = _amount;
    }

    function endAuction() public returns (string memory) {
        require(block.timestamp >= revealEnd, "Revealing period has not yet expired");
        require(msg.sender == seller, "Can only be called by seller");
        
        
        if(strat == 0){
            for(uint i=0;i<noBids;i++){
                if(addrToBid[bidAddrs[i]].value > winAmount){
                    winAmount = addrToBid[bidAddrs[i]].value;
                    winner = bidAddrs[i];
                }
            }
        }
        else if(strat == 1){
            uint maxAmount = winAmount;
            for(uint i=0;i<noBids;i++){
                if(addrToBid[bidAddrs[i]].value >= maxAmount){
                    winAmount = maxAmount;
                    maxAmount = addrToBid[bidAddrs[i]].value;
                    winner = bidAddrs[i];
                }
                if(addrToBid[bidAddrs[i]].value >= winAmount){
                    winAmount = addrToBid[bidAddrs[i]].value;
                }
            }
        }
        else if(strat == 2){
            uint totalAmount = 0;
            for(uint i=0;i<noBids;i++){
                totalAmount += addrToBid[bidAddrs[i]].value;
            }
            uint minDiff = totalAmount;
            
            for(uint i=0;i<noBids;i++){
                if(totalAmount - (addrToBid[bidAddrs[i]].value * noBids) < minDiff){
                    winAmount = addrToBid[bidAddrs[i]].value;
                    winner = bidAddrs[i];
                    minDiff = totalAmount - (addrToBid[bidAddrs[i]].value * noBids); 
                }
            }
        }

        // Deduct winning amount from winner
        balances[winner] -= winAmount;

        //Return the money to the losers
        for(uint i=0;i<noBids;i++){
            address payable payable_add = address(uint160(bidAddrs[i])); 
            payable_add.transfer(balances[bidAddrs[i]]);
        }

        // Return the winner's public key to the seller
        return addrToBid[winner].public_key;
    }
    
    function transferItem(string memory _encrypted_item) public {
        require(block.timestamp >= revealEnd, "Revealing period is yet to expire");
        require(msg.sender == seller, "Only callable by seller");
        address payable payable_seller = address(uint160(seller));
        payable_seller.transfer(winAmount);    
        encrypted_item = _encrypted_item;
    }

    function getItem() public view returns (string memory) {
        require(block.timestamp >= revealEnd, "Revealing period is yet to expire");
        return encrypted_item;
    }    

    function getSummary() public view returns (string memory, uint, uint, uint, uint, uint, uint, address) {
        return (name, basePrice, auctionStart, bidEnd, revealEnd, strat, noBids, seller, state);
    }

    function alreadyBid(address bidder) public view returns (bool) {
        return (addrToBid[bidder].hashedBid != bytes32(0x0));
    }
}

