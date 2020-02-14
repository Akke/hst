import React from "react";

import Selling from "../../Selling/Selling";

const SellingConsumer = (props) => {
    return (
        <Selling ref={props.pRef} sort={props.data.sort} autoRefresh={props.data.autoRefresh} loading={props.data.loading} offers={props.data.offers} filter={props.filterParams} allItems={props.allItems} skip={props.data.skip} limit={props.data.limit} />
    );
};

export default SellingConsumer;