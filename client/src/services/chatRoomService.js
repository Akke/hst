import axios from "axios";

export default {
	getOwnRooms: async () => {
		const res = await axios.get("/api/chatrooms");
		return res.data || [];
	},

	getRoomMessages: async (room) => {
		const res = await axios.get("/api/chatroom/messages", {
			params: {
				room: room
			}
		});
		
		return res.data || [];
	},

	sendMessage: async (message, room) => {
		const res = await axios.post("/api/chatroom/message", {
			message: message,
			room: room
		});

		return res.data || [];
	},

	getUnread: async() => {
		const res = await axios.get("/api/chatroom/unread");
		return res.data || [];
	}
}