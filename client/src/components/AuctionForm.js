import React from 'react';
import {
  Container,
  Form,
  Button
} from "react-bootstrap";

class AuctionForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      itemId: 0,
      itemName: "",
      itemDescription: "",
      basePrice: 0,
      bidDuration: 0,
      revealDuration: 0,
      stackId: 0,
      auctionType: 0,
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
    console.log(this.state.auctionType)
    const {
      drizzle,
      drizzleState
    } = this.props;
    const contract = drizzle.contracts.SolidityMart;
    var {
      itemName,
      basePrice,
      auctionType,
      bidDuration,
      revealDuration
    } = this.state
    bidDuration = bidDuration * 60
    revealDuration = revealDuration * 60
    // console.log(drizzleState.accounts[0])
    console.log(bidDuration, revealDuration)
    const stackId = contract.methods.createAuction(itemName, basePrice, bidDuration, revealDuration, auctionType).send({
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
            <Form.Label>Base Price (Wei):</Form.Label>
            <Form.Control
              key='basePrice'
              type='number'
              name='basePrice'
              value={this.state['basePrice']}
              placeholder='Enter product price (WEI)'
              onChange={this.handleChange}
            />
          </Form.Group>

          <Form.Group className='mb3'>
            <Form.Label>Bidding Duration (minutes): </Form.Label>
            <Form.Control
              key='bidDuration'
              type='number'
              name='bidDuration'
              value={this.state['bidDuration']}
              placeholder='Enter bidding duration (minutes)'
              onChange={this.handleChange}
            />
          </Form.Group>

          <Form.Group className='mb3'>
            <Form.Label>Reveal Duration (minutes)</Form.Label>
            <Form.Control
              key='revealDuration'
              type='number'
              name='revealDuration'
              value={this.state['revealDuration']}
              placeholder='Enter reveal duration (minutes)'
              onChange={this.handleChange}
            />
          </Form.Group>

          <Form.Group className='mb3'>
            <Form.Label> Select Auction Type:</Form.Label>
            <Form.Select 
              name="auctionType"
              value={this.state.auctionType}
              onChange={this.handleChange}
            >
              {/* <option>Select Auction type</option>   */}
              <option value='0'>First Price</option>  
              <option value='1'>Second Price</option>  
              <option value='2'>Average Price</option>  
            </Form.Select>
          </Form.Group>
          <br/>
          <Button type="submit">
            Submit
          </Button>
        </Form></Container>
    );
  }
}
export default AuctionForm;