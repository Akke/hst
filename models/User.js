const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    steamId: String,
    username: String,
    avatar: String,
    createdAt: String,
    accountId: String
});

module.exports = mongoose.model("users", userSchema);