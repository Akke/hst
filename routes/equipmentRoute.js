const mongoose = require("mongoose"),
    Equipment = mongoose.model("equipment"),
    EquipmentType = mongoose.model("equipment_types"),
    Joi = require("@hapi/joi"),
    i18n = require("i18n"),
    rateLimit = require("express-rate-limit");

const equipmentRateLimits = {
    get: rateLimit({
        windowMs: 1000,
        max: 3000
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

    app.get("/api/equipment", [equipmentRateLimits.get, jsonParser, csrfProtection], async(req, res) => {
        let item = req.query.item !== undefined ? req.query.item : null,
            search = {};

        if(item) Object.assign(search, { id: item });

        let equipment = await Equipment.find(search);
        
        return res.status(200).send(equipment);
    });

    app.get("/api/equipment/type", [equipmentRateLimits.get, jsonParser, csrfProtection], async(req, res) => {
        let equipmentTypes = await EquipmentType.find();
        
        return res.status(200).send(equipmentTypes);
    });
}