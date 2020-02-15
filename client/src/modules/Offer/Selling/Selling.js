import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button,
    Row,
    Col,
    ListGroup,
    ListGroupItem,
    UncontrolledCollapse
} from "reactstrap";

import userService from "../../../services/userService";
import equipmentService from "../../../services/equipmentService";
import steamService from "../../../services/steamService";
import abilityService from "../../../services/abilityService";
import io from "socket.io-client";
import Loading from "./Loading";
import { MessageSquare, MessageCircle, User, Clock, Hash, AlertTriangle, Zap, ThumbsUp, MoreHorizontal } from "react-feather";
import moment from "moment";
import config from "../../../config";
import abbreviateNumber from "../../../utils/abbreviateNumber";
import countryFlags from "../../../utils/countryFlags";
import axios from "axios";

export default class Selling extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            offers: null,
            equipmentAbilities: null,
            skip: this.props.skip,
            equipment: null
        };

        this.renderOffer = this.renderOffer.bind(this);
        this.reloadOffers = this.reloadOffers.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.offers !== nextProps.offers) {
            this.reloadOffers(nextProps.offers);
        }

        if(this.props.filter !== nextProps.filter) {
            this.setState({ mode: nextProps.filter.mode });
        }

        return true;
    }

    async componentDidMount() {
        const items = await equipmentService.getAll(),
            itemAbilities = await abilityService.getAll();

        this.setState({
            equipment: items,
            equipmentAbilities: itemAbilities
        });

        this.reloadOffers(this.props.offers);

        moment.relativeTimeThreshold("h", 24 * 26);

        const socket = io(config.api);
        socket.on("newOffer", (data) => {
            if(!this.props.autoRefresh) return;

            const item = [data, ...this.state.offers].filter(offer => offer.mode === this.props.filter.mode);
            this.reloadOffers(item);
        });
    }

    reloadOffers(props) {
        const offers = props.filter(offer => offer.mode == this.props.filter.mode);

        offers.forEach(async (offer) => {
            const user = await this.getUser(offer.user);
            offer.user = user[0];

            this.setState({ offers: props }); // This is spammed x(offer amount)
        });
    }

    async getUser(userId) {
        const user = await userService.getOne(userId),
            steamInfo = await steamService.getPlayerSummaries(user[0].steamId);

        Object.assign(user[0], {
            steamIsPublic: steamInfo.response.players[0].communityvisibilitystate == 3,
            steamIsPlaying: steamInfo.response.players[0].gameid == config.heroSiegeAppId
        });

        return user;
    }

    renderOffer(product) {
        const item = this.state.equipment.find(item => item.id == product.item.value),
            biddingExpires = moment.unix(product.createdAt).add(product.expires, "hours"),
            biddingTimeLeft = moment(biddingExpires, product.createdAt).fromNow(),
            date = moment.unix(product.createdAt).fromNow();

        return (
            <Card className="offer-card" key={product._id}>
                <div className="player-container">
                    <Link to="/me" className="player">
                        <img src={product.user.avatar} className={product.user.steamIsPublic && product.user.steamIsPlaying ? "in-game" : ""} />
                    </Link>

                    <div data-tooltip={countryFlags(product.region).name}>
                        <img src={`/images/flags/${countryFlags(product.region).image}.png`} className="flag" />
                    </div>
                </div>

                <CardBody>
                    <div className="gear-container">
                        <Link to={`/items/${item.id}`} className={"equipment-image d-block gear-" + (item.quality_id == "1" ? "satanic" : (item.quality_id == "2" ? "set" : (item.quality_id == "3" ? "angelic" : "")))}>
                            <div style={{ backgroundImage: `url("/images/equipment/${item.name}.png")` }}></div>
                        </Link>
                    </div>

                    <div className="offer-body mb-1 d-flex">
                        <div className="w-100">
                            <Link to={`/items/${item.id}`} className="offer-inline-header">
                                <span className="username">{product.user.username}</span> wants to sell
                                <div className="item-price">{abbreviateNumber(product.price)}</div>
                            </Link>

                            <div className="item-details">
                                <Link to={`/items/${item.id}`} className={"title text-" + (item.quality_id == "1" ? "satanic" : (item.quality_id == "2" ? "set" : (item.quality_id == "3" ? "angelic" : "")))}>
                                    {product.bidding ? <span className="badge badge-warning mr-2 badge-auction">Auction</span> : ""}
                                    {item.name}
                                </Link>
                                <div className="item-properties">
                                    <li><strong>Level:</strong> {product.level}</li>
                                    <li><strong>Quality:</strong> {product.quality}%</li>
                                    <li><Zap className="feather" /> <strong>Multishot</strong></li>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>

                <div className="card-footer">
                    <ul>
                        <li><Clock className="feather" /> <span>{date}</span></li>
                        {product.bidding ? <li className="auction"><AlertTriangle className="feather" /> <span>Auctions ends in {biddingTimeLeft}</span></li> : ""}
                        <li className="ml-auto"></li>
                        <li className="action" data-tooltip="Copy Whisper"><Hash className="feather" /></li>
                        <li className="action" data-tooltip="Send Message"><MessageCircle className="feather" /></li>
                    </ul>
                </div>
            </Card>
        );
    };

    renderItemViewOffer(product) {
        const item = this.state.equipment.find(item => item.id == product.item.value),
            biddingExpires = moment.unix(product.createdAt).add(product.expires, "hours"),
            biddingTimeLeft = moment(biddingExpires, product.createdAt).fromNow(),
            date = moment.unix(product.createdAt).fromNow(),
            itemAbility = this.state.equipmentAbilities.find(ability => ability.id == product.item.ability);

        return (
            <ListGroupItem key={product._id}>
                <Row id={`toggler-${product._id}`}>
                    <Col className="avatar" sm="1">
                        <img src={product.user.avatar} className={product.user.steamIsPublic && product.user.steamIsPlaying ? "in-game" : ""} />
                    </Col>

                    <Col className="seller">
                        <Link to="me">{product.user.username}</Link>
                    </Col>

                    <Col className="text-success">
                        <ThumbsUp className="feather" /> 102
                    </Col>

                    <Col>
                        {product.level}
                    </Col>

                    <Col>
                        {product.quality}%
                    </Col>

                    <Col>
                        <div className="item-price">{abbreviateNumber(product.price)}</div>
                    </Col>

                    <Col className="region">
                        <div data-tooltip={countryFlags(product.region).name} className="d-inline">
                            <img src={`/images/flags/${countryFlags(product.region).image}.png`} className="flag" />
                        </div>
                    </Col>

                    <Col sm="1" className="expand">
                        <MoreHorizontal  className="feather" />
                    </Col>
                </Row>

                <UncontrolledCollapse className="fade" toggler={`#toggler-${product._id}`}>
                    <Row>
                        <Col className="info-list">
                            <strong className="info-list-title">Seller</strong>
                            <Row>
                                <Col className="info-list-item-caption">Account ID</Col>
                                <Col>{product.user.accountId}</Col>
                            </Row>
                            <Row>
                                <Col className="info-list-item-caption">Username</Col>
                                <Col>{product.user.username}</Col>
                            </Row>
                            <Row>
                                <Col className="info-list-item-caption">Member Since</Col>
                                <Col>{moment(product.user.createdAt).format("YYYY-MM-DD")}</Col>
                            </Row>
                            <Row>
                                <Col className="info-list-item-caption">Standing</Col>
                                <Col>-</Col>
                            </Row>
                        </Col>

                        <Col className="info-list">
                            <strong className="info-list-title">Item</strong>
                            {product.item.ability > 0 ? 
                                (
                                    <Row>
                                        <Col className="info-list-item-caption">Ability</Col>
                                        <Col>{itemAbility.title}</Col>
                                    </Row>
                                ) : 
                            null}

                            <Row>
                                <Col className="info-list-item-caption">Runes</Col>
                                <Col>
                                    <ul className="rune-list">
                                        <li>
                                            <div className="badge badge-danger">
                                                <img src="/images/test_rune.png" /> Wii &times; 2
                                            </div>
                                        </li>
                                        <li>
                                            <div className="badge badge-danger">
                                                <img src="/images/test_rune.png" /> Jah &times; 2
                                            </div>
                                        </li>
                                        <li>
                                            <div className="badge badge-danger">
                                                <img src="/images/test_rune.png" /> Ham &times; 2
                                            </div>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                        </Col>

                        <Col className="info-list">
                            <strong className="info-list-title">Actions</strong>
                            <Row>
                                <Col>
                                    <button className="btn btn-info d-block mb-3">
                                        <User className="feather" /> Visit <strong>{product.user.username}</strong>'s Profile
                                    </button>

                                    <button className="btn btn-primary d-block mb-3">
                                        <MessageCircle className="feather" /> Message <strong>{product.user.username}</strong>
                                    </button>

                                    <button className="btn btn-dark d-block">
                                        <Hash className="feather" /> Copy Whisper
                                    </button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </UncontrolledCollapse>
            </ListGroupItem>
        );
    };

    render() {
        if(
            this.props.loading || 
            !this.state.offers ||
            !this.state.equipment ||
            !this.state.equipmentAbilities
        ) return <Loading />;
        
        if(this.props.itemView) {
            return (
                <ListGroup className="item-view-offers">
                    <ListGroupItem className="header">
                        <Row>
                            <Col sm="1"></Col>

                            <Col className="seller">
                                Seller
                            </Col>

                            <Col>
                                Reputation
                            </Col>

                            <Col>
                                Level
                            </Col>

                            <Col>
                                Quality
                            </Col>

                            <Col>
                                Price
                            </Col>

                            <Col>
                                Region
                            </Col>

                            <Col sm="1"></Col>
                        </Row>
                    </ListGroupItem>

                    {this.state.offers.map(offer => this.renderItemViewOffer(offer))}
                </ListGroup>
            );
        }

        return this.state.offers.map(offer => this.renderOffer(offer));
    }       
}
    