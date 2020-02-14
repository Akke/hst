import React from "react";

const NotFound = ({ location }) => (
    <div>The page <code>{location.pathname}</code> could not be found.</div>
);

export default NotFound;