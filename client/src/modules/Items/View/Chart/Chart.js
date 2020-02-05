import React from "react";
import {
	LineChart,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	Line
} from "recharts";

import _ from "underscore";
import moment from "moment";
import abbreviateNumber from "../../../../utils/abbreviateNumber";
import LoadingPage from "../../../../LoadingPage";

import "./_Chart.scss";

export default class Chart extends React.Component {
	constructor(props) {
		super(props);

		const groupByDay = _.groupBy(props.data, (date) => {
            return moment.unix(date.createdAt).startOf("day").format();
        });

        const result = _.map(groupByDay, (group, day) => {
            return {
                date: day.split("T")[0],
                avgPrice: group.reduce((avg, offer) => Math.trunc(avg + offer.price / group.length), 0)
            }
        });

        this.state = {
            data: result
        };
	}

	customTooltip(e) {
		if(e.active && e.payload != null && e.payload[0] != null) {
			return (
				<div className="chart-price-tooltip">
					<strong>Average Price</strong>
					<div className="small mt-1 d-block mb-1">{e.payload[0].payload["date"]}</div>
					<div className="small m-0">
						<img src="/images/icons/rubies.png" alt="Rubies" />
						{abbreviateNumber(e.payload[0].payload["avgPrice"])}
					</div>
				</div>
			);
		} else {
			return "";
		}
	}

	render() {
		const tickFormatter = (value) => abbreviateNumber(value);

		return (
			<LineChart
				type="monotone"
				width={600}
				height={180}
				data={this.state.data}
			>
				<YAxis dataKey="avgPrice" stroke="#d8d8d8" tickFormatter={tickFormatter} />
				<XAxis dataKey="date" stroke="#d8d8d8" />
				<Tooltip content={this.customTooltip} position={{ x: "auto", y: 0 }} />
				<Line type="monotone" dataKey="avgPrice" stroke="#1967be" yAxisId={0} strokeWidth={2} />
			</LineChart>
		);
	}
}