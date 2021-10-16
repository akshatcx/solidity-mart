import React from 'react';
import './App.css';
import ListingForm from './components/ListingForm';
import ListItems from './components/ListItems';
import ListingSeller from './components/ListingSeller';
import AuctionForm from './components/AuctionForm';
import NavBar from './components/NavBar';
import ListAuction from './components/ListAuction';
import { Route } from 'react-router-dom';
import AuctionSeller from './components/AuctionSeller';
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
        <Route exact path="/auctionlist" render={props=> <ListAuction drizzle={this.drizzle} drizzleState={this.drizzle.store.getState()} store={this.props.store}/>}/>
        <Route exact path="/auction" render={props=> <AuctionForm drizzle={this.drizzle} drizzleState={this.drizzle.store.getState()} store={this.props.store}/>}/>
        <Route exact path="/seller" render={props=> <ListingSeller drizzle={this.drizzle} drizzleState={this.drizzle.store.getState()} store={this.props.store}/>}/>
        <Route exact path="/auctionseller" render={props=> <AuctionSeller drizzle={this.drizzle} drizzleState={this.drizzle.store.getState()} store={this.props.store}/>}/>
      </div>
    );
  }
}

export default App;
