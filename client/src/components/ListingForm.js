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
import {
  ContractForm,
  ContractData
} from "@drizzle/react-components"

/**
 * 
 */
class ListingForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      itemName: "",
      itemDecription: "",
      itemPrice: 0,
      bindingTime: 0,
      revealTime: 0,
      stackId: 0,
      auctionType: "Listing",
    }
    // this.handleChange = this.handleChange.bind(this)
    // this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    const {
      drizzle
    } = this.props;
  }

  // handleChange(event) {
  //   const target = event.target;
  //   // console.log(target)
  //   const value = target.type === 'checkbox' ? target.checked : target.value;
  //   const name = target.name;

  //   this.setState({
  //     [name]: value
  //   });
  // }

  // handleSubmit(event) {
  //   event.preventDefault();
  //   const {
  //     drizzle,
  //     drizzleState
  //   } = this.props;
  //   const contract = drizzle.contracts.SolidityMart;
  //   const {
  //     itemName,
  //     itemDescription,
  //     itemPrice
  //   } = this.state
  //   const stackId = contract.methods['createListing'].cacheSend(itemName, itemDescription, itemPrice, {
  //     from: drizzleState.accounts[0]
  //   });
  //   this.setState({
  //     stackId: stackId
  //   });
  // }

  render() {
    return (
      // <Form onSubmit={this.handleSubmit}>
      //       <Form.Group className="mb-3" name="itemName">
      //         <Form.Control 
      //           type="text" 
      //           placeholder="Item name" 
      //           value={this.state.itemName} 
      //           onChange={this.handleChange}
      //           name="itemName"
      //         />

      //       </Form.Group>

      //       <Form.Group className="mb-3" name="itemDescription">
      //         <Form.Control 
      //           as="textarea"
      //           placeholder="Description" 
      //           rows={3} 
      //           value={this.state.itemDescription}
      //           onChange={this.handleChange}
      //           name="itemDescription"
      //         />
      //       </Form.Group>
      //       <Form.Group className="mb-3" name="itemPrice">
      //         <Form.Label>Item Price (ETH)</Form.Label>
      //         <Form.Control type="number" value={this.state.itemPrice} onChange={this.handleChange} name="itemPrice"/>
      //       </Form.Group>
      //       <Form.Label>Listing/Auction Type</Form.Label>
      //       <Form.Select name="auctionType" value={this.state.auctionType} onChange={this.handleChange}>
      //         <option value="Listing">Regular Listing</option>
      //         <option value="FPSB">First price sealed-bid auction</option>
      //         <option value="Vickrey">Vickrey auction</option>
      //         <option value="Average">Average auction</option>
      //       </Form.Select>
      //       {this.state.auctionType != "Listing"?
      //       <Form.Group class="mb-3" name="biddingTime">
      //         <Form.Label>Bidding Time (Seconds)</Form.Label>
      //         <Form.Control type="number" value={this.state.bindingTime} onChange={this.handleChange}/>
      //       </Form.Group>
      //       : ""}
      //       {this.state.auctionType != "Listing"?
      //       <Form.Group class="mb-3" name="revealTime">
      //         <Form.Label>Reveal Time (Seconds)</Form.Label>
      //         <Form.Control type="number" value={this.state.revealTime} onChange={this.handleChange}/>
      //       </Form.Group>
      //       : ""}
      //       <Button variant="primary" type="submit">
      //         Submit
      //       </Button>
      //     </Form> 
      <
      ContractForm contract = "SolidityMart"
      method = "createListing"
      render = {
        (inp) => {
          const { inputs, inputTypes, state, handleInputChange, handleSubmit } = inp
          return ( 
            <Form onSubmit={handleSubmit}>
            {  
              inputs.map((input, index) => {
                var inputType = inputTypes[index];
                var inputLabel = input.name;
                // check if input type is struct and if so loop out struct fields as well
                return (
                  <Form.Group>
                  <Form.Control
                    key={input.name}
                    type={inputType}
                    name={input.name}
                    value={this.state[input.name]}
                    placeholder={inputLabel}
                    onChange={handleInputChange}
                  />
                  </Form.Group>
                )
              })
            }
            <Button type="submit">
              Submit
            </Button>
            </Form>
          );
        }
      }
      />
    )
  }
}
export default ListingForm;