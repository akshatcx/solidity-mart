import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
// import drizzle functions and contract artifact
import { Drizzle } from "@drizzle/store";
import MyStringStore from "./contracts/MyStringStore.json";
import Auction from "./contracts/Auction.json";
import SolidityMart from "./contracts/SolidityMart.json";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import options from './drizzleOptions';
import store from './middleware';
import { DrizzleProvider } from '@drizzle/react-plugin'
// setup drizzle
const drizzle = new Drizzle(options, store);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* <DrizzleProvider options={options}> */}
      <DrizzleProvider store={store} options={options}>
      <App drizzle={drizzle} drizzleState={drizzle.store.getState()}/>
      </DrizzleProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
