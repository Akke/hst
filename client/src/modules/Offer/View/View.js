import React from "react";

export default class View extends React.Component {
	constructor(props) {
		super(props);

		this.param = this.props.match.params.item;
	}
	render() {
		return (
			<div>Showing item <strong>{this.param}</strong></div>
		);
	}
}