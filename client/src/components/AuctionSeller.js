import React from 'react';
import {
  Container,
  Form,
  Button,
  Table,
  Accordion,
} from "react-bootstrap";

import Auction from '../artifacts/Auction.json'
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
      transactionState: 0, // 0 -> Runnning, 1 -> Over, 2 -> Over, ended but not transferred, 3 -> donzo
    }
    // console.log('HERE')
    this.transferItem = this.transferItem.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.countDown = this.countDown.bind(this)
    this.secondsToTime = this.secondsToTime.bind(this)
    this.auctionTypes = ['First Price', 'Second Price', 'Average Price']
    this.endAuction = this.endAuction.bind(this)
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
        if (res[3] > now - res[2]) bidDuration = res[3] - (now - res[2]);
        else bidDuration = 0;
        // console.log(res[3], now - res[2], bidDuration)
        var revealDuration = 0;
        console.log(now > res[3]+ res[2], res[0])
        if (now >= res[3] + res[2] )
          revealDuration = res[4] - (now - (res[3] + res[2]))
        if (revealDuration<0) revealDuration = 0
        var auctionType = this.auctionTypes[res[5]];
        this.setState({
          res: res,
          auctionStart: res[2],
          bidDurationR: bidDuration,
          revealDurationR: revealDuration,
          bidDuration: res[3],
          revealDuration: res[4],
          auctionType: auctionType
        })
        if (revealDuration || bidDuration)
          this.timer = setInterval(this.countDown, 1000);
      });
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
    var { auctionStart, bidDuration, revealDuration, bidDurationR, revealDurationR } = this.state;
    // console.log('countDown')
    const date = new Date()
    const now = Math.round(date / 1000)
    if (now >= auctionStart && now < auctionStart + bidDuration && bidDurationR > 0) bidDurationR -= 1;
    else if (now <= auctionStart + bidDuration + revealDuration && revealDurationR > 0) revealDurationR -= 1
    else clearInterval(this.timer)
    console.log(now >= auctionStart + bidDuration, now < auctionStart + bidDuration + revealDuration, revealDurationR)
    this.setState({ revealDurationR: revealDurationR, bidDurationR: bidDurationR })
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
  
  endAuction() {
    this.contract.methods.endAuction().send({
      from: this.props.drizzleState.accounts[0],
    })
      .then(res => {
        console.log('Winner picked', res)
        this.setState({ publicKey: res, transactionState: 2})
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
    if (this.state.res[7] != this.props.drizzleState.accounts[0] || this.state.transferState == 3) return ""
    return (
      <tr>
       <td>{this.state.res[0]}</td>
        <td>{this.state.res[1]}</td>
        <td>{this.state.bidDurationR ? this.secondsToTime(this.state.bidDurationR) : "Over"}</td>
        <td>{this.state.revealDurationR == this.state.revealDuration ? "Not started" : !this.state.revealDurationR? "Over": this.secondsToTime(this.state.revealDurationR)}</td>
        <td>{this.state.auctionType}</td>
        <td>{this.state.res[6]}</td> 
        <td>{!this.state.revealDurationR &&
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>End Auction</Accordion.Header>

              <Accordion.Body>
                {
                  <div>
                    <Button type='submit' onClick={this.endAuction}>End Auction</Button>
                    {this.state.publicKey &&
                    <Form onSubmit={this.transferItem}>
                      {console.log(this.state.publicKey)}
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
                      <Button type='submit'>Transfer Product</Button>
                    </Form>
                      }
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

class AuctionSeller extends React.Component {
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
export default AuctionSeller;