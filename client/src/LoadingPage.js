import React from "react";

const LoadingPage = (props) => (
	<div className="page-loading">
		<img src={props.text ? `/images/loading_text.svg` : `/images/loading.svg`} />
	</div>
);

export default LoadingPage;