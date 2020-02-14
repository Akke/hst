import React, { useState, useEffect } from "react";
import {
    Row,
    Col
} from "reactstrap";

import { BrowserRouter as Router, Link } from "react-router-dom";
import Chart from "../Chart/Chart";
import LoadingPage from "../../../../LoadingPage";
import offerService from "../../../../services/offerService";

export default (props) => {
    const [chartData, setChartData] = useState(null),
        item = props.item,
        type = props.type,
        param = props.param;

    useEffect(() => {
        offerService.getChartMonth(param).then(data => {
            setChartData(data);
        });
    }, []);

    if(!chartData) return (<LoadingPage white={true} />);

    //<Chart data={chartData} />

    return (
        <div className="item-details">
            <div className="container">
                <Row>
                    <Col>
                        <div className="item-view-header">
                            <div className="gear-container">
                                <Link to={`/items/${item.id}`} className={"equipment-image d-block gear-" + (item.quality_id == "1" ? "satanic" : (item.quality_id == "2" ? "set" : (item.quality_id == "3" ? "angelic" : "")))}>
                                    <div style={{ backgroundImage: `url("/images/equipment/${item.name}.png")` }}></div>
                                </Link>
                            </div>

                            <div className="w-100">
                                <div className={"font-weight-bold text-" + (item.quality_id == "1" ? "danger" : (item.quality_id == "2" ? "success" : (item.quality_id == "3" ? "angelic" : "")))}>{item.name}</div>
                                <div>
                                    {type ? type.name : null}
                                </div>
                                
                                <button className="btn btn-primary">Item Details</button>
                            </div>
                        </div>
                    </Col>

                    <Col>
                    </Col>
                </Row>
            </div>
        </div>
    );
}