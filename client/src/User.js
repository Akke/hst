import React from "react";

import { userContext } from "./context/userContext";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: {}
		};

		this.logout = this.logout.bind(this);
	}

	// Add a logout method
	logout() {
		this.setState({user: {}});
	}

	componentDidMount() {
		// get and set currently logged in user to state
	}

	render() {
		// compose value prop as object with user object and logout method
		const value = {
			user: this.state.user,
			logoutUser: this.logout
		}
		
		return (
			<userContext.Provider value={value}>
				<Main/>
			</userContext.Provider>
		);
	}
}