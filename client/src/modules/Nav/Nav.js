import React, { useState } from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";

import { ShoppingCart, Grid, LifeBuoy, Shield, BookOpen } from "react-feather";

import "./_Nav.scss";

import PlayerSearch from "./PlayerSearch/PlayerSearch";
import UserArea from "./UserArea/UserArea";

const Navigation = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className="sticky-top">
            <Navbar light expand="md">
                <NavbarToggler onClick={toggle} />

                <Collapse isOpen={isOpen} navbar>
                    <Nav className="mr-auto" navbar>
                        <NavItem active>
                            <Link to={"/"} className="nav-link"><ShoppingCart className="feather" data-feather-fill /> Market</Link>
                        </NavItem>

                        <NavItem>
                            <Link to={"/news"} className="nav-link"><BookOpen className="feather" data-feather-fill /> News</Link>
                        </NavItem>

                        <NavItem>
                            <Link to={"/test"} className="nav-link"><Grid className="feather" /> Pricegrid</Link>
                        </NavItem>

                        <UncontrolledDropdown nav inNavbar>
                            <DropdownToggle nav caret>
                                <LifeBuoy className="feather" /> Help
                            </DropdownToggle>

                            <DropdownMenu>
                                <DropdownItem>F.A.Q</DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem>Report a Bug</DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>

                        <NavItem>
                            <Link to={"/test"} className="nav-link"><Shield className="feather" data-feather-fill /> Staff</Link>
                        </NavItem>
                    </Nav>

                    <PlayerSearch />
                </Collapse>

                <UserArea />
            </Navbar>
        </div>
    );
}

export default Navigation;