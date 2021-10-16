import React from 'react';
import {
  Container,
  Form,
  Button,
  Table,
  Accordion,
} from "react-bootstrap";
import LoadingOverlay from 'react-loading-overlay'
import Listing from '../artifacts/Listing.json'
const keypair = require('keypair')

class Buy extends React.Component {
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
      generatingKeys: false,
    }
    this.genKeyPair = this.genKeyPair.bind(this)
    this.getProduct = this.getProduct.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    const web3 = this.props.drizzle.web3
    this.contract = new web3.eth.Contract(Listing.abi, this.props.address)
    this.contract.methods.getSummary().call()
      .then(res => {
        res = Object.values(res)
        // console.log(res)
        this.setState({ res: res, transactionState: res[6] })
        if (!this.state.publicKey)
          this.setState({ publicKey: res[4] })
      });
    // console.log(this.contract.state)
    web3.eth.Contract.defaultAccount = this.props.drizzleState.accounts[0]
  }

  genKeyPair() {
    if (!this.state.publicKey) {
      console.log('generating keys...')
      const kp = keypair()
      if (kp) {
        console.log(kp.private)
        this.setState({publicKey: kp.public, privateKey: kp.private })
        const {
          drizzle,
          drizzleState
        } = this.props;
        console.log(this.state.res[2])
        this.contract.methods.initiateSale(kp.public).send({
          from: drizzleState.accounts[0],
          value: this.state.res[2]
        })
          .then(() => {
            this.setState({ transactionState: 1 })
          })
      }
    }
  }

  getProduct(e) {
    e.preventDefault();
    this.contract.methods.getItem().call()
      .then(res => {
        console.log("Successful", res, this.state.privateKey)
        var privateKey = this.state.privateKey;
        var privateKey_head = privateKey.match(/^-----BEGIN ((?:.*? KEY)|CERTIFICATE)-----/)[0]
        var privateKey_tail = privateKey.match(/-----END ((?:.*? KEY)|CERTIFICATE)-----$/)[0]
        var private_np = privateKey.replaceAll(' ', '')
        var privateKey_body = private_np.match(/^-----BEGIN.*-----([0-9A-z \n\r+/=]+)-----END.*-----$/)[1]
        var privateKey = privateKey_head + privateKey_body + privateKey_tail
        // const kp = keypair()
        // const enc = crypto.publicEncrypt({
        //   key: kp.public,
        //   padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        //   oaepHash: "sha256",
        // },
        // Buffer.from('ogay')
        // ).toString('hex') 
        const product = crypto.privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
          },
          Buffer.from(res, 'hex')
        );
        console.log(product.toString())
        this.setState({ transactionState: 3, product: product.toString()})
      })
      .catch(res => {
        console.log("Failed", res)
        this.setState({ transactionState: 1 })
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
    if (this.state.res[6] == 2) return ""
    return (
      <tr>
        <td>{this.state.res[0]}</td>
        <td>{this.state.res[1]}</td>
        <td>{this.state.res[2]}</td>
        <td>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header onClick={this.genKeyPair}>Buy</Accordion.Header>
              <Accordion.Body>
                {/* {console.log(this.state.transactionState, this.state.product)} */}
                {
                this.state.privateKey && this.state.transactionState == 1 &&
                  (

                    <div>
                      Click to copy your private key (store it safely):
                      <Button onClick={() => { navigator.clipboard.writeText(this.state.privateKey) }}>Private Key</Button>
                      <br />
                      Click to copy your public key:
                      <Button onClick={() => { navigator.clipboard.writeText(this.state.publicKey) }}>Public Key</Button>
                    </div>
                  )
                }
                {/* {this.state.transactionState == 0 && "Sending buy request..."} */}
                {
                  this.state.product == null &&
                  <div>
                    {/* <strong>Click to recieve your product:  </strong> */}
                    <Form onSubmit={this.getProduct}>
                      { !this.state.privateKey &&
                        <Form.Group>
                          <Form.Label>
                            Enter private key:
                          </Form.Label>
                          <Form.Control
                            key='privateKey'
                            type='text'
                            name='privateKey'
                            value={this.state.privateKey}
                            placeholder='Paste your private key here'
                            onChange={this.handleChange}
                          />
                        </Form.Group>
                      }
                      <Button type='submit'>Get Product</Button>
                    </Form>

                  </div>
                }
                {
                  this.state.transactionState == 2 &&
                  <div>Waiting for seller to transfer the product ...</div>
                }
                {
                  this.state.transactionState == 3 && this.state.product &&
                  <div>
                    <strong>Product:</strong>
                    <br />
                    {this.state.product}
                  </div>
                }
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </td>
      </tr>
    )
  }

}

class ListItems extends React.Component {
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
                    <Buy drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} address={displayData[element]} />
                  )
                  )
            }
          </tbody>
        </Table>
      </Container>
    )
  }
}
export default ListItems;