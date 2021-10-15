import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
// import drizzle functions and contract artifact
import { Drizzle } from "@drizzle/store";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
// import drizzleOptions from './drizzleOptions';
import store from './middleware';
import { DrizzleContext } from '@drizzle/react-plugin'
// setup drizzle
// import Auction from "./artifacts/Auction.json";
import SolidityMart from "./artifacts/SolidityMart.json";
import Listing from "./artifacts/Listing.json";


const doptions = {
  contracts: [SolidityMart, Listing],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:9545",
    },
  },
};
const drizzle = new Drizzle(doptions, store);

// console.log(typeof(drizzle.contracts))
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* <DrizzleProvider options={options}> */}
      {/* <DrizzleContext.Provider drizzle={drizzle}> */}
        {/* <DrizzleContext.Consumer> */}
          {
          // drizzleContext => {
          // const {drizzle, drizzleState, initialized} = drizzleContext;

          // if(!initialized) {
            // return "Loading..."
          // }
          }
            <App drizzle={drizzle} drizzleState={drizzle.store.getState()} store={store} />
        {/* </DrizzleContext.Consumer> */}
      {/* </DrizzleContext.Provider> */}
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
