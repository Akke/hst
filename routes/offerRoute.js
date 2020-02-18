const mongoose = require("mongoose"),
    Offer = mongoose.model("offers"),
    Joi = require("@hapi/joi"),
    i18n = require("i18n"),
    jwt = require("jsonwebtoken"),
    config = require("../config.js"),
    verifyToken = require("./middleware/verifyToken"),
    rateLimit = require("express-rate-limit");

const offerRateLimits = {
    get: rateLimit({
        windowMs: 1000,
        max: 100
    }),
    post: rateLimit({
        windowMs: 5000,
        max: 1
    })
};

const MAX_PRICE = 999999999999;

module.exports = (app, csrfProtection, jsonParser, io) => {
    i18n.configure({
        locales: ["en", "se", "pt", "de"],
        directory: __dirname + "/../locales",
        objectNotation: true,
        defaultLocale: "en",
        updateFiles: false
    });

    app.get("/api/offer", [offerRateLimits.get, jsonParser, csrfProtection], async(req, res) => {
        let limit = 10,
            skip = 0,
            mode = "sc",
            region = "ALL",
            minPrice = "1",
            maxPrice = MAX_PRICE,
            sort = "desc",
            item = null,
            range = "month";

        if(typeof req.query.limit != "undefined") limit = req.query.limit;
        if(typeof req.query.skip != "undefined") skip = req.query.skip;
        if(typeof req.query.mode != "undefined") mode = req.query.mode;
        if(typeof req.query.region != "undefined") region = req.query.region;
        if(typeof req.query.minPrice != "undefined") minPrice = req.query.minPrice;
        if(typeof req.query.maxPrice != "undefined") maxPrice = req.query.maxPrice;
        if(typeof req.query.sort != "undefined") sort = req.query.sort;
        if(typeof req.query.item != "undefined") item = req.query.item;
        if(typeof req.query.range != "undefined") range = req.query.range;

        if(limit > 25 || limit < 0) limit = 25;
        if(skip < 0 || skip > 25) skip = 0;

        const query = { 
            mode: mode, 
            region: (region == "ALL" ? { $exists: true } : region), 
            price: { 
                $gte: minPrice,
                $lte: (maxPrice != "1") ? maxPrice : MAX_PRICE
            }
        };

        if(item) Object.assign(query, { "item.value": +item });

        if(range == "month") {
            const currentMonth = new Date().getMonth(),
                currentYear = new Date().getFullYear(),
                currentMaxDays = new Date(currentYear, currentMonth, 0).getDate(),
                start = new Date(currentYear, currentMonth, 1).getTime() / 1000,
                end = new Date(currentYear, currentMonth, currentMaxDays).getTime() / 1000;

            Object.assign(query, { createdAt: {$gte: start, $lt: end} });
        }

        const offers = await Offer.find(query).skip(+skip).limit(+limit).sort({ createdAt: sort }),
            count = await Offer.countDocuments(query),
            sellers = await Offer.aggregate([
                {
                    "$match": item ? { "item.value": +item } : {}
                },
                {
                    "$group": {
                        "_id": {
                            "user": "$user"
                        }
                    }
                },
                {
                    "$group": {
                        "_id": 1,
                        count: { $sum: 1 }
                    }
                }
            ]);

        return res.status(200).send({ offers, count, sellers });
    });

    app.post("/api/offer", [offerRateLimits.post, jsonParser, csrfProtection, verifyToken], (req, res) => {
        i18n.setLocale("en");

        //todo: I suspect i18n is global and req is for the user only? 
        const schema = Joi.object({
            mode: Joi.string().valid("sc", "hc").min(2).max(2).required().messages({
                "string.base": `${i18n.__("api.errors.offer.create.mode.invalidType")}`,
                "any.only": `${i18n.__("api.errors.offer.create.mode.invalidOption")}`,
                "string.min": `${i18n.__("api.errors.offer.create.mode.sizeMin", `{#limit}`)}`,
                "string.max": `${i18n.__("api.errors.offer.create.mode.sizeMax", `{#limit}`)}`,
                "any.required": `${i18n.__("api.errors.offer.create.mode.required")}`
            }),
            item: Joi.object({
                label: Joi.string(),
                value: Joi.number().integer().min(1).required().messages({
                    "number.base": `${i18n.__("api.errors.offer.create.item.level.invalidType")}`,
                    "number.integer": `${i18n.__("api.errors.offer.create.item.level.invalidNumber")}`,
                    "number.min": `${i18n.__("api.errors.offer.create.item.level.sizeMin", `{#limit}`)}`,
                    "any.required": `${i18n.__("api.errors.offer.create.item.level.required")}`
                }),
                ability: Joi.when("weapon", { is: Joi.boolean().valid(true), then: Joi.number().integer().min(0).required(), otherwise: Joi.optional() }).messages({ //only required if weapon is true
                    "number.base": `${i18n.__("api.errors.offer.create.item.ability.invalidType")}`,
                    "number.integer": `${i18n.__("api.errors.offer.create.item.ability.invalidNumber")}`,
                    "number.min": `${i18n.__("api.errors.offer.create.item.ability.sizeMin", `{#limit}`)}`,
                    "any.required": `${i18n.__("api.errors.offer.create.item.ability.required")}`
                }),
                weapon: Joi.boolean(),
                quality: Joi.string()
            }).messages({
                "object.base": `${i18n.__("api.errors.offer.create.item.required")}`
            }),
            runes: Joi.array().items(Joi.object({
                //value,label,color,amount
                label: Joi.string(),
                color: Joi.string(),
                value: Joi.string().min(24).max(24).required().messages({
                    "number.base": `${i18n.__("api.errors.offer.create.runes.value.invalidType")}`,
                    "number.string": `${i18n.__("api.errors.offer.create.runes.value.invalidNumber")}`,
                    "number.min": `${i18n.__("api.errors.offer.create.runes.value.sizeMin", `{#limit}`)}`,
                    "any.required": `${i18n.__("api.errors.offer.create.runes.value.required")}`
                }),
                amount: Joi.number().integer().min(1).max(6).required().messages({
                    "number.base": `${i18n.__("api.errors.offer.create.runes.amount.invalidType")}`,
                    "number.integer": `${i18n.__("api.errors.offer.create.runes.amount.invalidNumber")}`,
                    "number.min": `${i18n.__("api.errors.offer.create.runes.amount.sizeMin", `{#limit}`)}`,
                    "number.max": `${i18n.__("api.errors.offer.create.runes.amount.sizeMax", `{#limit}`)}`,
                }),
            })).optional(),
            level: Joi.number().integer().min(1).max(10).required().messages({
                "number.base": `${i18n.__("api.errors.offer.create.level.invalidType")}`,
                "number.integer": `${i18n.__("api.errors.offer.create.level.invalidNumber")}`,
                "number.min": `${i18n.__("api.errors.offer.create.level.levelMin", `{#limit}`)}`,
                "number.max": `${i18n.__("api.errors.offer.create.level.levelMax", `{#limit}`)}`,
                "any.required": `${i18n.__("api.errors.offer.create.level.required")}`
            }),
            quality: Joi.number().integer().min(50).max(115).required().messages({
                "number.base": `${i18n.__("api.errors.offer.create.quality.invalidType")}`,
                "number.integer": `${i18n.__("api.errors.offer.create.quality.invalidNumber")}`,
                "number.min": `${i18n.__("api.errors.offer.create.quality.qualityMin", `{#limit}`)}`,
                "number.max": `${i18n.__("api.errors.offer.create.quality.qualityMax", `{#limit}`)}`,
                "any.required": `${i18n.__("api.errors.offer.create.quality.required")}`
            }),
            bidding: Joi.boolean().messages({
                "boolean.base": `${i18n.__("api.errors.offer.create.bidding.invalidOption")}`,
                "any.only": `${i18n.__("api.errors.offer.create.bidding.notAllowed")}`
            }),
            expires: Joi.when("bidding", { is: Joi.boolean().valid(true), then: Joi.number().integer().valid(6, 12, 24, 36).required(), otherwise: Joi.valid(null).optional() }).messages({
                "number.base": `${i18n.__("api.errors.offer.create.expires.invalidType")}`,
                "number.integer": `${i18n.__("api.errors.offer.create.expires.invalidNumber")}`,
                "any.only": `${i18n.__("api.errors.offer.create.expires.invalidOption")}`,
                "any.required": `${i18n.__("api.errors.offer.create.expires.required")}`
            }),
            price: Joi.when("bidding", { is: Joi.boolean().valid(false), then: Joi.number().integer().min(1).max(999999999).required(), otherwise: Joi.optional() }).messages({
                "number.base": `${i18n.__("api.errors.offer.create.price.invalidType")}`,
                "number.integer": `${i18n.__("api.errors.offer.create.price.invalidNumber")}`,
                "number.min": `${i18n.__("api.errors.offer.create.price.sizeMin", `{#limit}`)}`,
                "number.max": `${i18n.__("api.errors.offer.create.price.sizeMax", `{#limit}`)}`,
                "any.required": `${i18n.__("api.errors.offer.create.price.required")}`
            }),
            region: Joi.string().min(2).max(3).required().messages({
                "number.base": `${i18n.__("api.errors.offer.create.region.invalidType")}`,
                "number.min": `${i18n.__("api.errors.offer.create.region.sizeMin", `{#limit}`)}`,
                "number.max": `${i18n.__("api.errors.offer.create.region.sizeMax", `{#limit}`)}`,
                "any.required": `${i18n.__("api.errors.offer.create.region.required")}`
            })
        });

        const data = schema.validateAsync(req.body).then((data) => {
            const curTime = Date.now() / 1000 | 0;

            data = Object.assign(data, { createdAt: curTime, user: mongoose.Types.ObjectId(req.token.id) });
            const offer1 = new Offer(data);
            
            offer1.save((err, offer) => {
                if(err) return res.status(400).send(err);

                const dataWithId = Object.assign(data, { _id: offer.id });

                io.sockets.emit("newOffer", dataWithId);
                return res.status(200).send(dataWithId);
            });
        }).catch((e) => {
            return res.status(400).send(e);
        });
    });
}