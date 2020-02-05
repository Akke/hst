import React, { useState, useEffect, useRef } from "react";
import {
	DropdownMenu,
	DropdownItem
} from "reactstrap";

import "./_Items.scss";

const Items = (props) => {
	return (
		<DropdownMenu className="w-100 dropdown-menu-search fade">
			<DropdownItem>
				Search for <strong className="nav-search-phrase">something</strong>...
  				<div className="text-secondary"><small>We will attempt to find what you're looking for with an advanced search.</small></div>
			</DropdownItem>	

			<DropdownItem divider />
			<DropdownItem header>Players</DropdownItem>

			<DropdownItem className="search-users">
				<img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ac/ac44fbc3a1564e319bdeaa11cc5a3a4222c63e65_full.jpg" />
		    	<div className="user-data">
		    		<div className="user-text">
		    			<div>
		    				<span className="username">Akke</span>
		    				<span className="text-secondary small">1234</span>
		    			</div>
			    		<span className="badge badge-light">
			    			<span className="text-success">+15</span> / <span className="text-danger">-150</span> 
			    		</span>
			    	</div>

			    	<span className="reputation">
			    		<span className="badge badge-danger">Flagged</span>
			    	</span>
			    </div>
			</DropdownItem>						
		</DropdownMenu>
	);
}

export default Items;