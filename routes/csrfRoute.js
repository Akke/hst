const mongoose = require("mongoose"),
    Offer = mongoose.model("offers"),
    Joi = require("@hapi/joi"),
    rateLimit = require("express-rate-limit");

const csrfRateLimits = {
    get: rateLimit({
        windowMs: 1000,
        max: 3
    })
};

module.exports = (app, csrfProtection) => {
    app.get("/api/csrf", [csrfRateLimits.get, csrfProtection], async(req, res) => {
        return res.status(200).send(req.csrfToken());
    });
}