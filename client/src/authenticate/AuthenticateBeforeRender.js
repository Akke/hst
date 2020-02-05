import React from "react";

export default class AuthenticateBeforeRender extends React.Component {
	state = {
		isAuthenticated: false,
	}

	componentDidMount() {
		authenticate().then(isAuthenticated => {
			this.setState({ isAuthenticated });
		});
	}

	render() {
		return this.state.isAuthenticated ? this.props.render() : null;
	}
}