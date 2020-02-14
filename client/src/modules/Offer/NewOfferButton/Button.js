import React, { useState } from "react";
import { Button } from "reactstrap";
import { PlusCircle } from "react-feather";

import "./_Button.scss";
import { userContext } from "../../../context/user";
import NewOfferModal from "../NewOfferModal/Modal";

export default class NewOfferButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            isModalOpen: !this.state.isModalOpen
        });
    }

    render() {
        if(!this.context.user) return null;
        
        return (
            <div>
                <div className="new-offer" onClick={this.toggle}>
                    <Button color="primary" className="new-offer-button">
                        <PlusCircle className="feather d-block m-auto" /> 
                    </Button>

                    <span className="text-primary">Place Order</span>
                </div>

                <NewOfferModal isOpen={this.state.isModalOpen} toggle={this.toggle} equipment={this.props.equipment} />
            </div>
        );
    }
}

NewOfferButton.contextType = userContext;