import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import {
  Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button
} from "reactstrap";

import offerService from "../../../services/offerService";
import userService from "../../../services/userService";
import steamService from "../../../services/steamService";
import io from "socket.io-client";
import Loading from "./Loading";
import { MessageSquare, MessageCircle, User, Clock, Hash, AlertTriangle, Zap } from "react-feather";
import moment from "moment";
import config from "../../../config";
import abbreviateNumber from "../../../utils/abbreviateNumber";
import axios from "axios";

const DEFAULT_MODE = "sc";

export default class Selling extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            offers: null,
            skip: this.props.skip
        };

        this.renderOffer = this.renderOffer.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if((this.props.offers !== nextProps.offers) && nextProps.offers.length > 0) {
            const offers = nextProps.offers.filter(async (offer) => {
                if(offer.mode === DEFAULT_MODE) {
                    const sellers = await this.getUser(offer.user);
                    offer.user = sellers[0];

                    return offer;
                }
            });

            this.setState({
                offers: offers
            });
        }

        if(this.props.filter !== nextProps.filter) {
            this.setState({ mode: nextProps.filter.mode });
        }

        return true;
    }

    componentDidMount() {
        moment.relativeTimeThreshold("h", 24 * 26);

        const socket = io(config.api);
        socket.on("newOffer", (data) => {
            if(!this.props.autoRefresh) return;

            const item = [data, ...this.state.offers].filter(offer => offer.mode === DEFAULT_MODE);
            this.setState({ offers: item });
        });
    }

    async getUser(userId) {
        const user = await userService.getOne(userId);
        const steamInfo = await steamService.getPlayerSummaries(user[0].steamId);

        Object.assign(user[0], {
            steamIsPublic: steamInfo.response.players[0].communityvisibilitystate == 3,
            steamIsPlaying: steamInfo.response.players[0].gameid == config.heroSiegeAppId
        });

        return user;
    }

    renderOffer(product) {
        const item = this.props.allItems.find(item => item.id == product.item.value),
            biddingExpires = moment.unix(product.createdAt).add(product.expires, "hours"),
            biddingTimeLeft = moment(biddingExpires, product.createdAt).fromNow(),
            date = moment.unix(product.createdAt).fromNow();

        console.log(product)

        return (
            <Card className="offer-card" key={product._id}>
                <div className="player-container">
                    <Link to="/me" className="player">
                        <img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ca/ca19695d27816439b0bdb89371d20a887f845d3b_full.jpg" />
                    </Link>
                    <img src="/images/flags/europe.png" className="flag" />
                </div>

                <CardBody>
                    <div className="gear-container">
                        <Link to={`/items/${item.id}`} className={"equipment-image d-block gear-" + (item.quality_id == "1" ? "satanic" : (item.quality_id == "2" ? "set" : (item.quality_id == "3" ? "angelic" : "")))}>
                            <div style={{ backgroundImage: `url("/images/equipment/${item.name}.png")` }}></div>
                        </Link>
                    </div>

                    <div className="offer-body mb-1 d-flex">
                        <div className="w-100">
                            <Link to={`/items`} className="offer-inline-header">
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
                        <li className="action"><Hash className="feather" /></li>
                        <li className="action"><MessageCircle className="feather" /></li>
                    </ul>
                </div>
            </Card>
        );
    };

    render() {
        if(this.props.loading || !this.state.offers || this.props.allItems.length < 1) return <Loading />;
        
        return this.state.offers.map(offer => this.renderOffer(offer));
    }       
}
    