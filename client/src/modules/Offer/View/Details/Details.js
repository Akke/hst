import React from "react";

export default (props) => {
	const item = props.item,
		type = props.type;

	return (
		<div class="item-details">
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
						<Chart data={this.state.chartOffers} />
					</Col>
				</Row>
			</div>
		</div>
	);
}