pragma solidity >=0.4.0 <0.9.0;

/* Auction strats:
    0: First Price Sealed-Bid Auction
    1: Second Price Sealed-Bid Auction
    2: Average Price Sealed-Bid Auction
*/

/**
 * @title Auction
 * @author Akshat Chhajer, Shivansh Seth, Istasis Mishra
  * @dev A smart contract to create and manage a single auction
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
    
    /**
     * @dev Constructor for the contract. Creates a new auction
     * @param _name Name of the the listed item
     * @param _basePrice Base price of the item
     * @param _bidDuration Duration of the bid
     * @param _revealDuration Duration of the reveal period
     * @param _strat Auction strategy or format
     * @param _seller Address of the person creating the listing
    */ 
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

    /**
     * @dev To be called to place a bid
     * @param _hash the hashed value of the bid amount to keep it secret
     * @param _public_key Public key corresponding to the buyers private key. This key will be used by the seller to encrypt the item string before transfer. The encryption algorithm has to be decided beforehand (Test cases use RSA)
    */
    function bid(bytes32 _hash, string memory _public_key) public payable {
        require(block.timestamp < bidEnd, "Bidding period has expired");
        require(addrToBid[msg.sender].hashedBid == bytes32(0x0), "Only one bid per address allowed");
        require(msg.value >= basePrice, "Bid should not be less than base price");

        addrToBid[msg.sender] = Bid(_hash, _public_key, 0);
        bidAddrs.push(msg.sender);
        balances[msg.sender] += msg.value;
        noBids++;
    }
    
    /**
     * @dev To be called by the buyer to reveal the bid during bidding period
     * @param _amount The actual bid amount
    */
    function reveal(uint _amount) public {
        require(block.timestamp >= bidEnd, "Revealing period is yet to start");
        require(block.timestamp < revealEnd, "Revealing period has expired");
        require(keccak256(abi.encodePacked(_amount)) == addrToBid[msg.sender].hashedBid, 'Hash not equal'); //sha3
        require(_amount >= basePrice, "Bid should not be less than base price");
        require(_amount <= balances[msg.sender], "Bid less than deposit amount");

        addrToBid[msg.sender].value = _amount;
    }

    /**
     * @dev To be called by seller to end the auction, 
     * @return string (winners public key)
    */ 
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
        state = 3;
    }
    
    function getWinner() public view returns (string memory) {
        require (msg.sender == seller, "Only seller can get the winner");
        return addrToBid[winner].public_key;
    }
    /**
     * @dev To be called by seller on hearing a SaleInitiated() event. Emits a ItemTransferred() event which provides the encrypted string to the buyer (or anyone else listening)
     * @param _encrypted_item Item string encrypted with the public key of the buyer
     */
    function transferItem(string memory _encrypted_item) public {
        require(block.timestamp >= revealEnd, "Revealing period is yet to expire");
        require(msg.sender == seller, "Only callable by seller");
        address payable payable_seller = address(uint160(seller));
        payable_seller.transfer(winAmount);    
        encrypted_item = _encrypted_item;
        state = 4;
    }

    /**
     * @dev To be called by buyer to receive the encypted item
     * @return string
     */
    function getItem() public view returns (string memory) {
        require(block.timestamp >= revealEnd, "Revealing period is yet to expire");
        return encrypted_item;
    }    

    function getSummary() public view returns (string memory, uint, uint, uint, uint, uint, uint, address, uint) {
        return (name, basePrice, auctionStart, bidEnd, revealEnd, strat, noBids, seller, state);
    }

    function alreadyBid(address bidder) public view returns (bool) {
        return (addrToBid[bidder].hashedBid != bytes32(0x0));
    }
}

