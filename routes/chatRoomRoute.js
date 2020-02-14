const mongoose = require("mongoose"),
    ChatRoom = mongoose.model("chat_rooms"),
    ChatRoomMessage = mongoose.model("chat_room_messages"),
    verifyToken = require("./middleware/verifyToken"),
    belongsInChatRoom = require("./middleware/belongsInChatRoom"),
    Joi = require("@hapi/joi"),
    i18n = require("i18n"),
    rateLimit = require("express-rate-limit");

const createChatMessageLimiter = rateLimit({
    windowMs: 1000,
    max: 1
});

module.exports = (app, csrfProtection, jsonParser, io) => {
    app.get("/api/chatrooms", [jsonParser, csrfProtection, verifyToken], async(req, res) => {
        const chatRooms = await ChatRoom.find({
            users: {
                $in: mongoose.Types.ObjectId(req.token.id)
            }
        });
        
        return res.status(200).send(chatRooms);
    });

    app.get("/api/chatroom/messages", [jsonParser, csrfProtection, verifyToken, belongsInChatRoom], async(req, res) => {
        const room = req.query.room;

        const chatRoomMessages = await ChatRoomMessage.find({
            room: room
        });

        return res.status(200).send(chatRoomMessages);
    });

    app.post("/api/chatroom/message", [createChatMessageLimiter, jsonParser, csrfProtection, verifyToken, belongsInChatRoom], async(req, res) => {
        const schema = Joi.object({
            message: Joi.string().min(1).max(500).required().messages({
                "string.base": `${i18n.__("api.errors.chat.message.input.invalidType")}`,
                "string.min": `${i18n.__("api.errors.chat.message.input.sizeMin", `{#limit}`)}`,
                "string.max": `${i18n.__("api.errors.chat.message.input.sizeMax", `{#limit}`)}`,
                "any.required": `${i18n.__("api.errors.chat.message.input.required")}`
            }),
            room: Joi.required()
        });

        const message = schema.validateAsync(req.body).then(async (data) => {
            const curTime = Date.now() / 1000 | 0;
            const room = await ChatRoom.find({ _id: mongoose.Types.ObjectId(req.body.room) });
            const recipient = room[0].users.filter(r => r != req.token.id);

            data = Object.assign(data, { createdAt: curTime, user: req.token.id, read: false });
            const message1 = new ChatRoomMessage(data);
            
            message1.save((err, msg) => {
                if(err) return res.status(400).send(err);

                const dataWithId = Object.assign(data, { _id: msg.id });

                io.sockets.emit(`chat_room_message_${req.body.room}`, dataWithId);

                console.log(recipient)

                if(msg.user != recipient) io.sockets.emit(`chat_room_unread_${recipient}`, { amount: +1, room: req.body.room });

                return res.status(200).send(dataWithId);
            });
        }).catch((e) => {
            console.log(e)
            return res.status(400).send(e);
        });
    });

    app.get("/api/chatroom/unread", [jsonParser, csrfProtection, verifyToken], async(req, res) => {
        const result = [];

        const rooms = await ChatRoom.aggregate([
            {
                "$match": {
                    "users": { "$in": [mongoose.Types.ObjectId(req.token.id)] }
                }
            }
        ]);

        for(const doc of rooms) {
            const recipient = doc.users.filter(v => v != req.token.id)[0];

            const unreadMessages = await ChatRoomMessage.aggregate([
                {
                    "$match": {
                        "user": recipient,
                        "room": doc._id,
                        "read": false
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "room": "$room"
                        },
                        "unread": {
                            "$sum": { "$cond": [
                                { "$eq": ["$read", false ]},
                                1,
                                0
                            ]}
                        }
                    }
                },
            ]);

            if(unreadMessages[0]) result.push(unreadMessages[0]);
        }

        return res.status(200).send(result);
    });

    app.post("/api/chatroom/markasread", [jsonParser, csrfProtection, verifyToken, belongsInChatRoom], async(req, res) => {
        const room = await ChatRoom.find({ _id: mongoose.Types.ObjectId(req.body.room) });
        const recipient = room[0].users.filter(r => r != req.token.id);

        const mark = await ChatRoomMessage.updateMany(
            {
                room: req.body.room,
                user: recipient
            },
            {
                $set: { "read": true }
            }
        );

        return res.status(200).send({ success: true });
    });
}