import React from 'react';
import './App.css';
import ReadString from "./ReadString";
import SetString from "./SetString";
import { Tabs, Tab, Navbar, Nav, Container, FormControl, FormGroup, Form, Button} from "react-bootstrap";
import { ContractForm, ContractData } from "@drizzle/react-components"
import ListingForm from './components/ListingForm';
import ListItems from './components/ListItems';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stackId : null,
      loading: true,
      itemName: "",
      itemDescription: "",
      itemPrice: 0,
    }
  }
  componentDidMount() {
    const { drizzle } = this.props;
    this.unsubscribe = drizzle.store.subscribe(() => {
      const drizzleState = drizzle.store.getState();
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState });
      }
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  
 render() {
    if (this.state.loading) return "Loading Drizzle...";
    return (
      <Container>
        {/* <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="#home">Navbar</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#pricing">Pricing</Nav.Link>
            </Nav>
          </Container>
        </Navbar> */}
        <h2>Create Listing</h2>
        <ListingForm drizzle={this.props.drizzle} drizzleState={this.props.drizzleState}/>
        <br/>
        <h2>Available Items</h2>
        <ListItems dizzle={this.props.drizzle} drizzleState={this.props.drizzleState}/>
        {/* <ContractData contract="SolidityMart" method="listItems"/> */}
      </Container>
    );
  }
}

export default App;
