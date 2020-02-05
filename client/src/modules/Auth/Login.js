import React from "react";
import userService from "../../services/userService";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

export default class Login extends React.Component {
	render() {
		if(!localStorage.getItem("user")) {
            userService.readCookie().then((data) => {
                localStorage.setItem("user", JSON.stringify(data.token));
                localStorage.setItem("expires", new Date(new Date().getTime() + 60 * 60 * 24 * 1000));
                window.location.reload();
            }).catch((err) => {
                console.error(err);
            });
        }

        return <Redirect to="/"  />;
	}
}