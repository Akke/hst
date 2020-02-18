const mongoose = require("mongoose"),
    Socketable = mongoose.model("socketables"),
    SocketableType = mongoose.model("socketable_types"),
    Joi = require("@hapi/joi"),
    i18n = require("i18n"),
    rateLimit = require("express-rate-limit");

const socketableRateLimits = {
    get: rateLimit({
        windowMs: 1000,
        max: 3000
    })
};

module.exports = (app, csrfProtection, jsonParser) => {
    app.get("/api/socketable", [socketableRateLimits.get, jsonParser, csrfProtection], async(req, res) => {
        let socketable = await Socketable.find();
        
        return res.status(200).send(socketable);
    });

    app.get("/api/socketable/type", [socketableRateLimits.get, jsonParser, csrfProtection], async(req, res) => {
        let socketableTypes = await SocketableType.find();
        
        return res.status(200).send(socketableTypes);
    });
}