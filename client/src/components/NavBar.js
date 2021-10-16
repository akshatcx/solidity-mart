import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
function NavBar() {
  return (
    <Navbar bg="dark" expand="lg" variant="dark">
      <Navbar.Brand href="#home">Solidity-Mart</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <LinkContainer to='/'>
            <Nav.Link>Listings</Nav.Link>
          </LinkContainer>
          <LinkContainer to='/list'>
            <Nav.Link >Add Listing</Nav.Link>
          </LinkContainer>
          <LinkContainer to='/auctionlist'>
            <Nav.Link >Auctions</Nav.Link>
          </LinkContainer>
          <LinkContainer to='/auction'>
            <Nav.Link >Create Auction</Nav.Link>
          </LinkContainer>
          <LinkContainer to='/seller'>
            <Nav.Link >Your Listings</Nav.Link>
          </LinkContainer>
          <LinkContainer to='/auctionseller'>
            <Nav.Link >Your Auctions</Nav.Link>
          </LinkContainer>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
export default NavBar;