import React, { useState, useEffect } from "react";
import {
    Row,
    Col
} from "reactstrap";

import { BrowserRouter as Router, Link } from "react-router-dom";
import Chart from "../Chart/Chart";
import LoadingPage from "../../../../LoadingPage";
import offerService from "../../../../services/offerService";
import { ArrowRight } from "react-feather";
import moment from "moment";

export default (props) => {
    const [chartData, setChartData] = useState(null),
        item = props.items[0],
        type = props.type,
        param = props.param,
        lastOfferDate = props.lastOfferDate ? moment.unix(props.lastOfferDate).fromNow() : "Never";

    useEffect(() => {
        offerService.getChartMonth(param).then(data => {
            setChartData(data);
        });
    }, []);

    if(!chartData) return (<LoadingPage white={true} />);

    //<Chart data={chartData} />

    return (
        <div className="item-view-details">
            <div className="item-view-header">
                <div className={"gear-container gear-" + (item.quality_id == "1" ? "satanic" : (item.quality_id == "2" ? "set" : (item.quality_id == "3" ? "angelic" : ""))) }>
                    <Link to={`/items/${item.id}`} className={"equipment-image d-block gear-" + (item.quality_id == "1" ? "satanic" : (item.quality_id == "2" ? "set" : (item.quality_id == "3" ? "angelic" : "")))}>
                        <div style={{ backgroundImage: `url("/images/equipment/${item.name}.png")` }}></div>
                    </Link>
                </div>

                <div className="item-view-information">
                    <h4 className={"font-weight-bold d-inline text-" + (item.quality_id == "1" ? "satanic" : (item.quality_id == "2" ? "set" : (item.quality_id == "3" ? "angelic" : "")))}>{item.name}</h4>
                    <div className="item-type">{props.type.name}</div>

                    <ul className="statistics">
                        <li>
                            <div className="count">{props.totalOffers}</div>
                            <span>Offers</span>
                        </li>

                        <li>
                            <div className="count">{props.totalSellers}</div>
                            <span>Sellers</span>
                        </li>

                        <li>
                            <div className="count">Last Offer</div>
                            <span>{lastOfferDate}</span>
                        </li>

                        <li className="price-history">
                            <Link to="me">
                                <span>
                                    <span className="count">Average Price</span>
                                    <span><div className="item-price">-</div></span>
                                </span>

                                <ArrowRight className="feather" />
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <Row>
                <Col>
                    
                </Col>

                <Col>
                </Col>
            </Row>
        </div>
    );
}