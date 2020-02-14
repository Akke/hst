import React from "react";
import ContentLoader from "react-content-loader";

export default(_ => {
    return (
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
    );
})