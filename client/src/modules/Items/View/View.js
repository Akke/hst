import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import loadable from "@loadable/component";
import {
    Row,
    Col,
    ListGroup,
    ListGroupItem
} from "reactstrap";

import equipmentService from "../../../services/equipmentService";
import LoadingPage from "../../../LoadingPage";
import { ThumbsUp, ThumbsDown, Minus } from "react-feather";
import "./_View.scss";

const Details = loadable(() => import("./Details/Details"));

export default class View extends React.Component {
    constructor(props) {
        super(props);

        this.param = this.props.match.params.item;

        this.state = {
            item: [],
            types: []
        };
    }

    async componentDidMount() {
        const item = await equipmentService.getOne(this.param),
            types = await equipmentService.getTypes();

        this.setState({
            item: item[0],
            types: types
        });
    }

    render() {
        if(this.state.item.length < 1) {
            return (
                <div className="wrapper">
                    <LoadingPage />
                </div>
            );
        }

        const item = this.state.item,
            type = this.state.types.filter(type => type.id == item.type_id)[0];

        return (
            <div>
                <Details item={item} type={type} param={this.param} />

                <div className="wrapper">
                    <div className="container">
                        <Row>
                            <Col sm="2">
                                <ListGroup>
                                    <ListGroupItem tag="a" href="#" action>
                                        Orders (102)
                                    </ListGroupItem>
                                    <ListGroupItem tag="a" href="#" action className="text-muted">
                                        Auctions (2)
                                    </ListGroupItem>
                                </ListGroup>
                            </Col>

                            <Col>
                                <div className="item-offers">
                                    <ul className="sorting">
                                        <li>
                                            <Row>
                                                <Col sm="1"></Col>

                                                <Col lg="2">
                                                    Seller
                                                </Col>

                                                <Col>
                                                    Price
                                                </Col>

                                                <Col>
                                                    Level
                                                </Col>

                                                <Col>
                                                    Quality
                                                </Col>

                                                <Col>
                                                    Ability
                                                </Col>

                                                <Col>
                                                    Runes
                                                </Col>

                                                <Col>
                                                    Reputation
                                                </Col>
                                            </Row>
                                        </li>
                                    </ul>

                                    <ul>
                                        <li>
                                            <Row>
                                                <Col sm="1" className="text-center col-avatar">
                                                    <img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ac/ac44fbc3a1564e319bdeaa11cc5a3a4222c63e65_full.jpg" className="avatar" />
                                                </Col>

                                                <Col className="col-username" lg="2">
                                                    <a href="ok" className="font-weight-bold d-block">Akke</a>
                                                    <div class="badge badge-primary">ONLINE ON-SITE</div>
                                                </Col>

                                                <Col className="text-info">
                                                    <img src="/images/icons/rubies.png" alt="Rubies" className="price-icon" />
                                                    &times; <span className="font-weight-bold">150k</span>
                                                </Col>

                                                <Col>
                                                    <span className="font-weight-bold">10</span> of 10
                                                </Col>

                                                <Col>
                                                    <span className="font-weight-bold">99%</span>
                                                </Col>

                                                <Col>
                                                    <div class="badge badge-dark">Buriza</div>
                                                </Col>

                                                <Col>
                                                    <ul>
                                                        <li><strong>(x2) Wii</strong></li>
                                                    </ul>
                                                </Col>

                                                <Col className="col-reputation text-success">
                                                    <ThumbsUp className="feather" />
                                                    102
                                                </Col>
                                            </Row>
                                        </li>
                                    </ul>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}