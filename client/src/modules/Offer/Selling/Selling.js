import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import {
  Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button
} from "reactstrap";

import offerService from "../../../services/offerService";
import io from "socket.io-client";
import ContentLoader from "react-content-loader";
import { MessageSquare, MessageCircle, User } from "react-feather";
import moment from "moment";

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

        const socket = io("http://localhost:5000");
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
        		<div className="gear-container">
					<Link to={`/items/${item.id}`} className={"equipment-image d-block gear-" + (item.quality_id == "1" ? "satanic" : (item.quality_id == "2" ? "set" : (item.quality_id == "3" ? "angelic" : "")))}>
				    	<div style={{ backgroundImage: `url("/images/equipment/${item.name}.png")` }}></div>
				    </Link>
				</div>

				<CardBody>
					<div className="offer-header mb-1 d-flex">
			    		<div>
			    			<Link to={`/items/${item.id}`} className={"font-weight-bold text-decoration-none text-" + (item.quality_id == "1" ? "danger" : (item.quality_id == "2" ? "success" : (item.quality_id == "3" ? "warning" : "")))}>
			    				{item.name}
			    			</Link>
			    			{product.bidding ? <div className="badge badge-warning ml-2">Auction: Ends {biddingTimeLeft}</div> : ""}
			    			<div>
			    				<span className="badge badge-dark mr-1">{product.region}</span>
			    				<span className="badge badge-light mr-1">Quality: {product.quality}%</span>
			    				<span className="badge badge-light mr-1">Level: {product.level}/10</span>
			    				<span className="badge badge-light">Ability: {product.item.ability}</span>
			    			</div>
			    		</div>

			    		<div className="ml-auto">
			    			<span className="small">Listed {date}</span>
			    			<span className="badge badge-success ml-2">ONLINE IN-GAME</span>
			    		</div>
			    	</div>

			    	<div className="offer-footer small">
			    		<div className="price-type">
			    			<span className="amount">
			    				<img src="/images/icons/rubies.png" alt="Rubies" />
			    				x <span className="font-weight-bold">{product.price}</span>
			    			</span>	
			    		</div>

			    		<div className="whisper ml-2">
			    			<a href="ok">
			    				<User className="feather" /> <span className="font-weight-bold">Akke</span> (1120250)
			    			</a>
			    		</div>

			    		<div className="whisper ml-auto">
			    			<a href="ok"><MessageSquare className="feather" data-feather-fill /> Whisper</a>
			    		</div>

			    		<div className="whisper ml-2">
			    			<a href="ok"><MessageCircle className="feather" data-feather-fill /> Message</a>
			    		</div>
			    	</div>
				</CardBody>
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
						speed={2}
						primaryColor="#f3f7fb"
						secondaryColor="#eef3f7"
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