# Smart Contracts - Marketplace

Team - 4
Akshat Chhajer, Istasis Mishra and Shivansh Seth
 
### Overview

The transactions in the market take place via a single smart contract "SolidityMarket". Sellers create listings for their products which can be bought by interested buyers. A single transaction consists of 4 events in the following order:
- NewListing: Alerts any listener (Buyers) of a new product listing
- SaleInitiated: Alerts the seller of an interested buyer with a valid offer and the broadcasts the public key of buyer
- ItemTransferred: Alerts the buyer of a successful delivery
- FundsReleased: Alerts the seller on succesful transfer of funds

These events are emitted by appropriate functions (see `contracts/SolidityMart.sol` for documentation) and are waited on by actors (buyers and sellers) external to the blockchain. These actors then call appropriate functions from the contract.

### Security
To ensure the security of the item during transaction, the "Pretty Good Privacy" or PGP procedure is followed. The seller uses the public key obtained from the buyer to encrypt the item string. This string is exposed to any listeners of the `ItemTransferred` event, however, it can only be decrypted by the buyer's private key. 