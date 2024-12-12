import React, { Fragment, useContext } from "react";

import { UserContext } from "../../contexts/user";

import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";
import { signOutUser } from "../../utils/firebase/firebase";

const Layout = (props) => {
    const { currentUser } = useContext(UserContext)

    const handleSignOut = async () => {
        await signOutUser()
    }

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
                    <Nav className="ml-auto">
                        {currentUser === null ? <Nav.Link as={Link} to="/login">Login</Nav.Link> : <Nav.Link onClick={handleSignOut}>Logout</Nav.Link>}
                    </Nav>
                </Container>
            </Navbar>
            <Outlet />
        </Fragment>
    )
}

export default Layout