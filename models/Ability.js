const mongoose = require("mongoose");
const { Schema } = mongoose;

const abilitySchema = new Schema({
    title: String,
    description: String
});

module.exports = mongoose.model("abilities", abilitySchema);