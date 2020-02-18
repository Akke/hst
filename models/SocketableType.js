const mongoose = require("mongoose");
const { Schema } = mongoose;

const socketableTypeSchema = new Schema({
    id: Number,
    name: String,
    type: String
});

module.exports = mongoose.model("socketable_types", socketableTypeSchema);