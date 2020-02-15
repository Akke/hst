const countryFlags = code => {
    switch(code) {
        case "AU":
            return {image: "Australia", name: "Australia"};
        case "BR":
            return {image: "Brazil", name: "Brazil"};
        case "CN1":
            return {image: "China", name: "China 1"};
        case "CN2":
            return {image: "China", name: "China 2"};
        case "EU1":
            return {image: "Europe", name: "Europe 1"};
        case "EU2":
            return {image: "Europe", name: "Europe 2"};
        case "USW":
            return {image: "United_States_of_America", name: "US West"};
        case "USE":
            return {image: "United_States_of_America", name: "US East"};
        case "ALL":
            return {image: "UN", name: "International (All)"};
        default:
            return {image: "UN", name: "International (All)"};
    }
}

export default countryFlags;