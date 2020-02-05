const mongoose = require("mongoose");
const { Schema } = mongoose;

const offerSchema = new Schema({
    type: String,
    mode: String,
    item: {
        value: Number,
        label: String,
        weapon: String,
        ability: Number,
        quality: String,
    },
    runes: Array,
    level: Number,
    quality: Number,
    bidding: Boolean,
    buyout: Number,
    expires: Number,
    price: Number,
    region: String,
    createdAt: Number
});

mongoose.model("offers", offerSchema);