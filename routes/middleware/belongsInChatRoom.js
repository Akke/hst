const mongoose = require("mongoose"),
	ChatRoom = mongoose.model("chat_rooms");

const belongsInChatRoom = async (req, res, next) => {
	let room = null;
	switch(req.method) {
		case "GET":
			room = req.query.room;
			break;
		case "POST":
			room = req.body.room;
			break;
	}

	if(!room || room.length < 1) return res.status(403).send({ message: "No room provided." });

	const belongsInRoom = await ChatRoom.find({
			_id: mongoose.Types.ObjectId(room), 
			users: {
				$in: mongoose.Types.ObjectId(req.token.id)
			}
		}).count() > 0;

	if(!belongsInRoom) return res.status(403).send({ message: "Does not belong in the given room." });

	next();
}

module.exports = belongsInChatRoom;