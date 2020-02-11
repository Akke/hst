import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import {
  Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button
} from "reactstrap";

import offerService from "../../../services/offerService";
import io from "socket.io-client";
import ContentLoader from "react-content-loader";
import { MessageSquare, MessageCircle, User, Clock, Hash, AlertTriangle, Zap } from "react-feather";
import moment from "moment";
import config from "../../../config";
import abbreviateNumber from "../../../utils/abbreviateNumber";

export default class Selling extends React.Component {
	constructor(props) {
        super(props);

        this.state = {
            offers: [],
            empty: false,
            skip: this.props.skip,
            mode: "sc"
        };

        this.renderOffer = this.renderOffer.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
		if(this.props.offers !== nextProps.offers) {
			let empty = false;

			const offers = nextProps.offers.filter(offer => (offer.mode === this.state.mode));
		    if(offers.length < 1) empty = true;

		    this.setState({ 
		    	offers: offers,
		    	empty: empty
		    });
		}

		if(this.props.filter !== nextProps.filter) {
			this.setState({ mode: nextProps.filter.mode });
		}

		return true;
	}

    componentDidMount() {
    	moment.relativeTimeThreshold("h", 24*26);
        document.title = "herosiege.trade";

        const socket = io(config.api);
		socket.on("newOffer", (data) => {
			if(!this.props.autoRefresh) return;

			const item = [data, ...this.state.offers].filter(offer => (offer.mode === this.state.mode));
			this.setState({ offers: item });
		});
    }

    renderOffer(product) {
    	const item = this.props.allItems.find(item => item.id == product.item.value),
	    	biddingExpires = moment.unix(product.createdAt).add(product.expires, "hours"),
	    	biddingTimeLeft = moment(biddingExpires, product.createdAt).fromNow(),
	    	date = moment.unix(product.createdAt).fromNow();

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
			    				<span className="username">Akke</span> wants to sell
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
		return (
			<div>
				{!this.props.loading && (this.state.offers.length > 0 && this.props.allItems.length > 0) ? (
	                this.state.offers.map(offer => this.renderOffer(offer))
	            ) : (!this.state.empty ? (
	            	<ContentLoader 
						height={210}
						width={400}
						speed={1}
						primaryColor="#101114"
						secondaryColor="#0c0c0e"
					>
						<rect x="0" y="0" rx="2" ry="2" width="400" height="65" />
						<rect x="0" y="70" rx="2" ry="2" width="400" height="65" />
						<rect x="0" y="140" rx="2" ry="2" width="400" height="65" />
					</ContentLoader>
	            	) : (
	            	<div className="alert alert-danger">
	            		We could not find any orders matching your search parameters.
	        		</div>
	            	)
	            )}
            </div>
		);
	}
}