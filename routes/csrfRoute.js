const mongoose = require("mongoose"),
	Offer = mongoose.model("offers"),
	Joi = require("@hapi/joi");

module.exports = (app, csrfProtection) => {
    app.get("/api/csrf", csrfProtection, async(req, res) => {
        return res.status(200).send(req.csrfToken());
    });
}