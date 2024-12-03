import React, { Fragment } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

const Layout = (props) => {
    return (
        <Fragment>
            <Navbar bg="dark" variant="dark" sticky="top">
                <Container fluid>
                    <Navbar.Brand href="#">TTRPG Playground</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/characters">Characters</Nav.Link>
                        <Nav.Link as={Link} to="/campaigns">Campaigns</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Outlet />
        </Fragment>
    )
}

export default Layout