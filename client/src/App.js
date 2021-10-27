import React from 'react';
import './App.css';
import ReadString from "./ReadString";
import SetString from "./SetString";
import { Tabs, Tab, Navbar, Nav, Container, FormControl, FormGroup, Form, Button } from "react-bootstrap";
import { ContractForm, ContractData } from "@drizzle/react-components"
import ListingForm from './components/ListingForm';
import ListItems from './components/ListItems';
import ListingSeller from './components/ListingSeller';
import NavBar from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
// import options from './drizzleOptions';
// import store from './middleware'
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stackId: null,
      loading: true,
      itemName: "",
      itemDescription: "",
      itemPrice: 0,
    }
  }
  componentDidMount() {
    const { drizzle } = this.props
    this.unsubscribe = drizzle.store.subscribe(() => {
      
    const drizzleState = drizzle.store.getState()
      // console.log(drizzleState.drizzleStatus)
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState });
      }
    });
    this.drizzle = drizzle;
  }
  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    if (this.state.loading) return "Loading Drizzle...";
    return (
      <div className="App">
        <NavBar></NavBar>
        <Route exact path="/" render={props=> <ListItems drizzle={this.drizzle} drizzleState={this.drizzle.store.getState()} store={this.props.store}/>}/>
        <Route exact path="/list" render={props=> <ListingForm drizzle={this.drizzle} drizzleState={this.drizzle.store.getState()} store={this.props.store}/>}/>
        <Route exact path="/seller" render={props=> <ListingSeller drizzle={this.drizzle} drizzleState={this.drizzle.store.getState()} store={this.props.store}/>}/>
      </div>
    );
  }
}

export default App;
