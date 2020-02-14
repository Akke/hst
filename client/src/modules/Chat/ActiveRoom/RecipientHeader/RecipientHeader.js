import React from "react";
import { useAsync } from "react-async-hook";
import loadable from "@loadable/component";
import { BrowserRouter as Router, Link } from "react-router-dom";
import userService from "../../../../services/userService";

const LoadingPage = loadable(() => import("../../../../LoadingPage"));

const fetchRecipient = async recipient => {
    return await userService.getOne(recipient);
}

const RecipientHeader = props => {
    const recipient = useAsync(fetchRecipient, [props.recipient]);

    return (
        <div>
            {recipient.loading && <LoadingPage />}
            {recipient.result && (
                <div className="recipient-header">
                    <img src={recipient.result[0].avatar} />
                    <div className="user-details">
                        <div className="username">{recipient.result[0].username}</div>
                        <Link to={"/"} className="d-block">Visit Profile</Link> 
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecipientHeader;