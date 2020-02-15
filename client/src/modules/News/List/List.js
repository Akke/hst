import React from "react";
import {
    ListGroup,
    ListGroupItem,
    Col
} from "reactstrap";

import "./_List.scss";

export default class News extends React.Component {
    render() {
        return (
            <Col xs="3">
                <ListGroup className="news-list-group">
                    <ListGroupItem tag="a" href="#" className="title">News</ListGroupItem>

                    <ListGroupItem active tag="a" href="#" action>
                        <strong>Lorem ipsum dolor sit amet...</strong>
                        <div className="small">
                        Posted 10 hours ago
                        </div>
                    </ListGroupItem>
                    <ListGroupItem tag="a" href="#" action className="text-muted">
                        <strong>Lorem ipsum dolor sit amet...</strong>
                        <div className="small">
                        Posted 10 hours ago
                        </div>
                    </ListGroupItem>
                    <ListGroupItem tag="a" href="#" action className="text-muted">
                        <strong>Lorem ipsum dolor sit amet...</strong>
                        <div className="small">
                        Posted 10 hours ago
                        </div>
                    </ListGroupItem>
                    <ListGroupItem tag="a" href="#" action className="text-muted">
                        <strong>Lorem ipsum dolor sit amet...</strong>
                        <div className="small">
                        Posted 10 hours ago
                        </div>
                    </ListGroupItem>
                    <ListGroupItem tag="a" href="#" action className="text-muted">
                        <strong>Lorem ipsum dolor sit amet...</strong>
                        <div className="small">
                        Posted 10 hours ago
                        </div>
                    </ListGroupItem>
                </ListGroup>
            </Col>
        );
    }
}