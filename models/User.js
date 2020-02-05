const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    steamId: String,
    username: String,
    avatar: String,
    accountId: String,
    accessToken: String,
    refreshToken: String
});

module.exports = mongoose.model("users", userSchema);