const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatRoomMessageSchema = new Schema({
    user: mongoose.Types.ObjectId,
    room: mongoose.Types.ObjectId,
    message: String,
    createdAt: Number,
    read: Boolean
});

module.exports = mongoose.model("chat_room_messages", chatRoomMessageSchema);