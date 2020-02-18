import React from "react";

export const context = {
    socketables: {
        items: null,
        types: null
    },
    equipment: {
        items: null,
        types: null,
        abilities: null
    }
};

export const DbContext = React.createContext(context);