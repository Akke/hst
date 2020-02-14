const mongoose = require("mongoose"),
    Abilities = mongoose.model("abilities"),
    Joi = require("@hapi/joi"),
    i18n = require("i18n"),
    rateLimit = require("express-rate-limit");

const abilityRateLimits = {
    get: rateLimit({
        windowMs: 1000,
        max: 50
    })
};

module.exports = (app, csrfProtection, jsonParser) => {
    i18n.configure({
        locales: ["en", "se", "pt", "de"],
        directory: __dirname + "/../locales",
        objectNotation: true,
        defaultLocale: "en",
        updateFiles: false
    });

    app.get("/api/ability", [abilityRateLimits.get, jsonParser, csrfProtection], async(req, res) => {
        let ability = await Abilities.find();
        
        return res.status(200).send(ability);
    });
}