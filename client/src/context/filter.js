import React from "react";

export const filter = {
    mode: "sc",
    region: "ALL",
    minPrice: "1",
    maxPrice: "1"
};

export const FilterContext = React.createContext({
    mode: filter.mode,
    region: filter.region,
    updateFilter: () => {},
});