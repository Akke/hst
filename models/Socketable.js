const mongoose = require("mongoose");
const { Schema } = mongoose;

const socketableSchema = new Schema({
    id: Number,
    name: String,
    type: String
});

module.exports = mongoose.model("socketables", socketableSchema);