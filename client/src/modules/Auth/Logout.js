import React from "react";
import userService from "../../services/userService";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

export default class Logout extends React.Component {
	render() {
		if(localStorage.getItem("user")) {
	        userService.deleteCookie().then(_ => {
	            localStorage.removeItem("user");
	            window.location.reload();
	        }).catch((err) => {
	            console.error(err);
	        });
	    }

	    return <Redirect to="/"  />;
	}
}