import { Drizzle } from "@drizzle/store";
import Auction from "./artifacts/Auction.json";
import SolidityMart from "./artifacts/SolidityMart.json";
import Listing from "./artifacts/Listing.json";


const options = {
  contracts: [SolidityMart, Listing],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:9545",
    },
  },
};
export default options;