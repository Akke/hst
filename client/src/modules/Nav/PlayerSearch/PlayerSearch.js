import React, { useState, useEffect } from "react";
import {
    Form,
    Dropdown, 
    DropdownMenu, 
    DropdownToggle,
    Input,
    DropdownItem
} from "reactstrap";

import { Search } from "react-feather";
import Items from "./Item/Items";
import "./_PlayerSearch.scss"

const PlayerSearch = (props) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggle = () => {
        setDropdownOpen(prevState => !prevState);
    }

    return (
        <div>
            <Form inline className="my-0 my-lg-0 nav-search" spellCheck="false"> 
                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle
                        tag="div"
                        data-toggle="dropdown"
                        aria-expanded={dropdownOpen}
                    >
                        <Search className="feather search-icon" />
                        
                        <Input className="form-control" type="search" placeholder="Enter an account ID or username to search" aria-label="Search" role="button" id="menuSearch" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" />
                    </DropdownToggle>

                    <Items />
                </Dropdown>
            </Form>
        </div>
    );
}

export default PlayerSearch;