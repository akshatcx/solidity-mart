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
  Button,
  Table,
  Card,
  AccordionButton,
  Accordion,
  Alert
} from "react-bootstrap";

import Listing from '../artifacts/Listing.json'
const crypto = require("crypto");

class Row extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: this.props.id,
      address: this.props.address,
      res: null,
      publicKey: null,
      privateKey: null,
      transactionState: 0, // 0 -> not initiated, 1 -> initiated, waiting for response, 2 -> requested but not transferred by seller
      product: null,
    }
    // console.log('HERE')
    this.transferItem = this.transferItem.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    const web3 = this.props.drizzle.web3
    this.contract = new web3.eth.Contract(Listing.abi, this.props.address)
    this.contract.methods.getSummary().call()
      .then(res => {
        res = Object.values(res)
        // console.log(res)
        this.setState({ res: res, transactionState: res[6], publicKey: res[4] })
        if (res[6] == 1) {
          this.contract.methods.getBuyerKey().call({ from: this.props.drizzleState.accounts[0] })
            .then(res => {
              this.setState({ publicKey: res, transactionState: 2 })
            });
        }
      });
    web3.eth.Contract.defaultAccount = this.props.drizzleState.accounts[0]
  }

  transferItem(e) {
    e.preventDefault();
    // console.log(this.state.publicKey)
    console.log("TRANSFERITEM");
    const encryptedData = crypto.publicEncrypt(
      {
        key: this.state.publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(this.state.product)
    ).toString('hex');
    console.log(encryptedData)
    this.contract.methods.transferItem(encryptedData).send({
      from: this.props.drizzleState.accounts[0],
    })
      .then(res => {
        console.log('ItemSent')
        console.log(res)
        this.setState({ transactionState: 3 })
      })
      .catch(res => {
        console.log(res)
      })
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

  render() {
    if (!this.state.res) {
      return "Fetching..."
    }
    if (this.state.res[3] != this.props.drizzleState.accounts[0] || this.state.transferState == 3) return ""
    return (
      <tr>
        <td>{this.state.res[0]}</td>
        <td>{this.state.res[1]}</td>
        <td>{this.state.res[2]}</td>
        <td>{this.state.transactionState == 2 &&
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Transfer</Accordion.Header>

              <Accordion.Body>
                {
                  this.state.transactionState == 2 &&
                  <div>
                    <Form onSubmit={this.transferItem}>
                      {this.state.publicKey &&
                        <Form.Group>
                          <Form.Label>
                            Enter Product:
                          </Form.Label>
                          <Form.Control
                            key='product'
                            type='text'
                            name='product'
                            value={this.state.product}
                            placeholder='Enter your product string here'
                            onChange={this.handleChange}
                          />
                        </Form.Group>
                      }
                      <Button type='submit'>TransferProduct</Button>
                    </Form>

                  </div>
                }
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        }</td>
      </tr>
    )
  }

}

class ListingSeller extends React.Component {
  constructor(props) {
    super(props)
    this.contracts = this.props.drizzle.contracts;
    this.state = {
      dataKey: null,
    };
    // this.handleChange = this.handleChange.bind(this)
    // this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    const {
      drizzle, drizzleState
    } = this.props;
    this.drizzle = drizzle;
    if (this.props.drizzleState.drizzleStatus.initialized) {
      const contract = drizzle.contracts.SolidityMart
      const dataKey = contract.methods['getListings'].cacheCall()
      this.setState({ dataKey })
    }
  }

  render() {
    if (!this.props.drizzleState.drizzleStatus.initialized) {
      return <span>Initializing...</span>;
    }
    if (
      !(
        this.state.dataKey in
        this.props.drizzleState.contracts.SolidityMart.getListings
      )
    ) {
      return <span>Fetching...</span>;
    }

    var displayData = this.props.drizzleState.contracts.SolidityMart.getListings[this.state.dataKey].value;
    // console.log(typeof(displayData))

    return (
      <Container>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              // "yeet"
              !displayData ? "YEET" :
                Object.keys(displayData)
                  .map(element => (
                    <Row drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} address={displayData[element]} />
                  )
                  )
            }
          </tbody>
        </Table>
      </Container>
    )
  }
}
export default ListingSeller;