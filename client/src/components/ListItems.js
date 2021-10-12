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
  Accordion
} from "react-bootstrap";
import {
  ContractForm,
  ContractData
} from "@drizzle/react-components"

/**
 * 
 */
class ListItems extends React.Component {
  constructor(props) {
    super(props)
    // this.handleChange = this.handleChange.bind(this)
    // this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    const {
      drizzle, drizzleState
    } = this.props;
  }

  render() {
    return ( <
      ContractData contract ="SolidityMart"
        method="listItems"
        render={
          (inp) => {
            console.log(inp)
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
                    inp?
                    inp.map((row, index) => {
                    // console.log(row)
                    return (
                      <tr>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                      <td>{row[3]}</td>
                      
                      <td>
                         <Accordion>
                          <Accordion.Item eventKey="0">
                            <Accordion.Header>Buy</Accordion.Header>
                            <Accordion.Body>
                              <ContractForm 
                                contract="SolidityMart" 
                                method="initiateSale"
                                sendArgs={
                                  {
                                    from: this.props.drizzleState.accounts[0],
                                    value: row[3],
                                  } 
                                }
                              />
                            </Accordion.Body>
                          </Accordion.Item>
                         </Accordion>
                      </td>
                    
                      </tr>
                    )
                  }): ""
                  }
                </tbody>
            </Table>
            </Container>
            )
          }
        }
      />
    );
  }
}
export default ListItems;