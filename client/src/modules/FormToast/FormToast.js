import React, { useState } from "react";
import { Button, Toast, ToastBody, ToastHeader } from "reactstrap";

import "./_FormToast.scss";

let timer = null;

export default class FormToast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            header: "",
            body: "",
            className: ""
        };

        this.display = this.display.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    display(header, body, className) {
        if(this.state.isOpen) return;

        this.setState({
            isOpen: true,
            header: header,
            body: body,
            className: className
        });

        timer = setTimeout(() => {
            this.toggle();
        }, 5000);
    }

    toggle() {
        clearTimeout(timer);
        this.setState({ isOpen: false });
    }

    render() {
        return (
            <div className="bg-danger">
            <Toast isOpen={this.state.isOpen} className={"site-alert site-alert-"+this.state.className} onClick={this.toggle}>
                <ToastHeader>{this.state.header}</ToastHeader>
                <ToastBody>{this.state.body}</ToastBody>
            </Toast>
            </div>
        );
    }
}