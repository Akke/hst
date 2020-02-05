import React, { useState } from "react";
import loadable from "@loadable/component";
import {
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from "reactstrap";

import { userContext } from "../../../context/user";
import "./_UserArea.scss";

const dropdownRef = React.createRef(),
	Chat = loadable(() => import("../Chat/Chat"));

const UserArea = (props) => {
	const [dropdownOpen, setDropdownOpen] = useState(false),
		toggle = () => {
			setDropdownOpen(prevState => !prevState);

			switch(dropdownOpen) {
				case false:
					dropdownRef.current.classList.add("active");
					break;
				case true:
					dropdownRef.current.classList.remove("active")
					break;
			}
		};

	return (
		<userContext.Consumer>
		{({user}) => {
			if(!user) {
				return (
				<div>
			    	<a href="/api/user/login" className="login-with-steam">Login with Steam</a>
			    </div>
				);
			}

			return (
				<React.Fragment>
					<div className="user-area-container" ref={dropdownRef}>
						<Dropdown nav inNavbar toggle={toggle} isOpen={dropdownOpen}>
							<DropdownToggle nav caret>
								<div className="user-area">
						          	<img src={user.avatar} />
						          	<div className="username">
						          		<div className="nickname">{user.username}</div>
						          	</div>
						          	<div className="expand-down"></div>
						          </div>
							</DropdownToggle>

							<DropdownMenu>
								<DropdownItem>F.A.Q</DropdownItem>
								<DropdownItem divider />
								<DropdownItem href="/logout">Logout</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>

					<Chat />
				</React.Fragment>
			);
		}}
		</userContext.Consumer>
	);
}

export default UserArea;