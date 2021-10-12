import { Drizzle } from "@drizzle/store";
import MyStringStore from "./contracts/MyStringStore.json";
import Auction from "./contracts/Auction.json";
import SolidityMart from "./contracts/SolidityMart.json";


const options = {
  contracts: [MyStringStore, Auction, SolidityMart],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:9545",
    },
  },
};
export default options;