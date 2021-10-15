import React from 'react';
import {
  Tabs,
  Tab,
  Navbar,
  Nav,
  Container,
  FormControl,
  FormGroup,
  Form,
  Button
} from "react-bootstrap";

/**
 * 
 */
class ListingForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      itemId: 0,
      itemName: "",
      itemDescription: "",
      itemPrice: 0,
      bindingTime: 0,
      revealTime: 0,
      stackId: 0,
      auctionType: "Listing",
    }
    // this.contracts = context.drizzle.contracts;
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    const target = event.target;
    // console.log(target)
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const {
      drizzle,
      drizzleState
    } = this.props;
    const contract = drizzle.contracts.SolidityMart;
    const {
      itemName,
      itemDescription,
      itemPrice
    } = this.state
    console.log(drizzleState.accounts[0])
    const stackId = contract.methods.createListing(itemName, itemDescription, itemPrice).send({
      from: drizzleState.accounts[0]
    });
    this.setState({
      stackId: stackId
    });
  }

  render() {
    return (
      <Container>
        <br></br>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group className='mb3'>
            <Form.Label>Item Name:</Form.Label>
            <Form.Control
              key='itemName'
              type='text'
              name='itemName'
              value={this.state['itemName']}
              placeholder='Enter product name'
              onChange={this.handleChange}
            />
          </Form.Group>

          <Form.Group className='mb3'>
            <Form.Label>Item Description:</Form.Label>
            <Form.Control
              key='itemDescription'
              type='textArea'
              name='itemDescription'
              value={this.state['itemDescription']}
              placeholder='Enter product description'
              onChange={this.handleChange}
            />
          </Form.Group>

          <Form.Group className='mb3'>
            <Form.Label>Item Price (Wei):</Form.Label>
            <Form.Control
              key='itemPrice'
              type='number'
              name='itemPrice'
              value={this.state['itemPrice']}
              placeholder='Enter product price (WEI)'
              onChange={this.handleChange}
            />
          </Form.Group>
          <br/>
          <Button type="submit">
            Submit
          </Button>
        </Form></Container>
    );
  }
}
export default ListingForm;