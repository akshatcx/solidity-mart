import React from 'react';
import {
  Container,
  Form,
  Button,
  Table,
  Accordion,
} from "react-bootstrap";
import Auction from '../artifacts/Auction.json'
const keypair = require('keypair')
const crypto = require("crypto");
const keccak256 = require('keccak256')


class Buy extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: this.props.id,
      address: this.props.address,
      res: null,
      publicKey: null,
      privateKey: null,
      transactionState: 0, // 0 -> no bid made, 1 -> bid, waiting for reveal period, 2 -> reveal period, can reveal now, 3 -> revealed, waiting for product/winner
      product: null,
      generatingKeys: false,
      auctionStart: null,
      bidEnd: null,
      bidDurationR: null,
      revealDurationR: null,
      revealEnd: null,
      auctionType: null,
      bidValue: null,
      depositValue: null,
    }
    this.timer = 0;
    this.genKeyPair = this.genKeyPair.bind(this)
    this.getProduct = this.getProduct.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.countDown = this.countDown.bind(this)
    this.secondsToTime = this.secondsToTime.bind(this)
    this.auctionTypes = ['First Price', 'Second Price', 'Average Price']
    this.revealBid = this.revealBid.bind(this)
  }

  componentDidMount() {
    const web3 = this.props.drizzle.web3
    const date = new Date()
    const now = Math.round(date / 1000)
    this.contract = new web3.eth.Contract(Auction.abi, this.props.address)
    this.contract.methods.getSummary().call()
      .then(res => {
        res = Object.values(res)
        var bidDuration = 0;
        if (res[3] > now) bidDuration = res[3] - now;
        else bidDuration = 0;
        var revealDuration = res[4] - res[3];
        if (now >= res[3])
          revealDuration = res[4] - now;
        if (revealDuration < 0) revealDuration = 0
        var auctionType = this.auctionTypes[res[5]];
        var auctionType = this.auctionTypes[res[5]];
        this.setState({
          res: res,
          auctionStart: res[2],
          bidDurationR: bidDuration,
          revealDurationR: revealDuration,
          bidEnd: res[3],
          revealEnd: res[4],
          auctionType: auctionType
        })
        if (bidDuration)
          this.timer = setInterval(this.countDown, 1000);
      });
    this.contract.methods.alreadyBid(this.props.drizzleState.accounts[0]).call()
      .then(res => {
        if (res) {
          this.setState({
            transactionState: 1,
            publicKey: localStorage.getItem('publicKey'),
            privateKey: localStorage.getItem('privateKey'),
            bidValue: localStorage.getItem('bidValue'),
          })
        }
      })
    web3.eth.Contract.defaultAccount = this.props.drizzleState.accounts[0]
  }

  secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = hours + ' h: ' + minutes + ' m: ' + seconds + ' s'
    return obj;
  }

  countDown() {
    var { auctionStart, bidEnd: bidDuration, revealEnd: revealDuration, bidDurationR, revealDurationR } = this.state;

    const date = new Date()
    const now = Math.round(date / 1000)
    if (now >= auctionStart && now < auctionStart + bidDuration && bidDurationR > 0) bidDurationR -= 1;
    else if (now <= auctionStart + bidDuration + revealDuration && revealDurationR > 0) revealDurationR -= 1
    else clearInterval(this.timer)
    console.log(now >= auctionStart + bidDuration, now < auctionStart + bidDuration + revealDuration, revealDurationR)
    this.setState({ revealDurationR: revealDurationR, bidDurationR: bidDurationR })
  }

  genKeyPair(e) {
    e.preventDefault();
    if (this.state.depositValue < this.state.bidValue) {
      alert('Deposit has to be more than bid')
      return
    }

    if (this.state.bidValue < this.state.res[1]) {
      alert('Cannot bid lower than base price')
      return
    }

    if (!this.state.publicKey) {
      console.log('generating keys...')
      const kp = keypair()
      console.log('keys generated!')
      if (kp) {
        const {
          drizzle,
          drizzleState
        } = this.props;

        var hexed_bid = drizzle.web3.utils.soliditySha3(this.state.bidValue)
        console.log(hexed_bid)
        this.contract.methods.bid(hexed_bid, kp.public).send({
          from: drizzleState.accounts[0],
          value: this.state.depositValue
        })
          .then(() => {
            this.setState({ transactionState: 1, publicKey: kp.public, privateKey: kp.privateKey })
            localStorage.setItem('privateKey', kp.privateKey)
            localStorage.setItem('publicKey', kp.publicKey)
            localStorage.setItem('bidValue', this.state.bidValue)
          })
          .catch(err => {
            alert("Bid already made for this auction!")
            return
          })
      }
    }
  }

  revealBid(e) {
    e.preventDefault()
    this.contract.methods.reveal(this.state.bidValue).send({
      from: this.props.drizzleState.accounts[0]
    })
      .then(() => {
        this.setState({ transactionState: 2 })
      })
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
        const product = crypto.privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
          },
          Buffer.from(res, 'hex')
        );
        console.log(product.toString())
        this.setState({ transactionState: 3, product: product.toString() })
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
    if (!this.state.bidDurationR && this.state.transactionState == 0) return ""
    if (!this.state.res) {
      return "Fetching..."
    }
    // console.log(this.state.res)
    return (
      <tr>
        <td>{this.state.res[0]}</td>
        <td>{this.state.res[1]}</td>
        <td>{this.state.bidDurationR ? this.secondsToTime(this.state.bidDurationR) : "Over"}</td>
        <td>{this.state.revealDurationR == this.state.revealEnd ? "Not started" : !this.state.revealDurationR? "Over": this.secondsToTime(this.state.revealDurationR)}</td>
        <td>{this.state.auctionType}</td>
        <td>{this.state.res[6]}</td>
        <td>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Bid</Accordion.Header>
              <Accordion.Body>
                {
                  this.state.transactionState == 0 &&
                  (
                    <div>
                      <Form onSubmit={this.genKeyPair}>
                        <Form.Group>
                          <Form.Label>
                            Bid value (Wei):
                          </Form.Label>
                          <Form.Control
                            key='bidValue'
                            type='number'
                            name='bidValue'
                            value={this.state.bidValue}
                            onChange={this.handleChange}
                          />
                        </Form.Group>

                        <Form.Group>
                          <Form.Label>
                            Deposit value (must be greater than bid value):
                          </Form.Label>
                          <Form.Control
                            key='depositValue'
                            type='number'
                            name='depositValue'
                            value={this.state.depositValue}
                            onChange={this.handleChange}
                          />
                        </Form.Group>
                        <Button type='submit'>Submit bid</Button>
                      </Form>
                    </div>
                  )
                }
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
                {
                  this.state.transactionState == 1 && !this.state.bidDurationR &&
                  (
                    <Button onClick={this.revealBid}>
                      Reveal Bid
                    </Button>
                  )
                }
                {
                  this.state.transactionState == 2 && "Waiting for auction to end"
                }
                {/* {this.state.transactionState == 0 && "Sending buy request..."} */}
                {
                  this.state.product == null && this.state.transactionState == 3 &&
                  <div>
                    {/* <strong>Click to recieve your product:  </strong> */}
                    <Form onSubmit={this.getProduct}>
                      {!this.state.privateKey &&
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

class ListAuction extends React.Component {
  constructor(props) {
    super(props)
    this.contracts = this.props.drizzle.contracts;
    this.state = {
      dataKey: null,
    };
  }

  componentDidMount() {
    const {
      drizzle, drizzleState
    } = this.props;
    this.drizzle = drizzle;
    if (this.props.drizzleState.drizzleStatus.initialized) {
      const contract = drizzle.contracts.SolidityMart
      const dataKey = contract.methods['getAuctions'].cacheCall()
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
        this.props.drizzleState.contracts.SolidityMart.getAuctions
      )
    ) {
      return <span>Fetching...</span>;
    }

    var displayData = this.props.drizzleState.contracts.SolidityMart.getAuctions[this.state.dataKey].value;

    return (
      <Container>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Base Price</th>
              <th>Bid Duration</th>
              <th>Reveal Duration</th>
              <th>Auction Type</th>
              <th>Number of bids</th>
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
export default ListAuction;