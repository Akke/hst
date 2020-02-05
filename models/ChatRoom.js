const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatRoomSchema = new Schema({
    users: Array,
    createdAt: Number
});

module.exports = mongoose.model("chat_rooms", chatRoomSchema);