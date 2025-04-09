import { NavbarBrand, NavLink } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function MainNavBar() {
  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <NavbarBrand href="/">PROJECT</NavbarBrand>
          <Nav className="me-auto">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/quotations">Quotation</NavLink>
            <NavLink href="/invoices">Invoices</NavLink>
            <NavLink href="/items">Items</NavLink>
            <NavLink href="/customers">Customers</NavLink>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}