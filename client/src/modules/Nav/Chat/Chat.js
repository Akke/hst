import React, { useState, useEffect } from "react";
import loadable from "@loadable/component";
import { useAsync } from "react-async-hook";
import { MessageCircle } from "react-feather";
import chatRoomService from "../../../services/chatRoomService";
import io from "socket.io-client";
import "./_Chat.scss";

const Chat = loadable(() => import("../../Chat/Chat"));

const fetchUnreadCount = async _ => {
	return await chatRoomService.getUnread();
}

export default(_ => {
	const [chatOpen, setChatOpen] = useState(false);
	const [unread, setUnread] = useState(null);
	const asyncUnreadCount = useAsync(fetchUnreadCount, []);

	useEffect(() => {
		if(!unread && asyncUnreadCount.result) {
			const sumCount = Object.values(asyncUnreadCount.result).reduce((a, b) => a.unread + b.unread);
			console.log(sumCount)
			setUnread(sumCount);
		}
	}, [asyncUnreadCount]);

	useEffect(() => {
		const socket = io("http://localhost:5000");
		socket.on("chat_room_unread", (data) => {
			setUnread(unread + data.amount);
		});
	}, []);

	const toggle = () => {
		if(!chatOpen) {
			document.querySelector(".navbar").style.width = document.querySelector(".navbar").offsetWidth - 325 + "px";
		} else {
			document.querySelector(".navbar").style.width = "100%";
		}
		
		setChatOpen(!chatOpen);
	}

	return (
		<div>
			<div className={"nav-chat " + (chatOpen ? "active" : "")} onClick={toggle} data-unread={unread}>
				<MessageCircle className="feather" />
			</div>

			<Chat isOpen={chatOpen} unread={asyncUnreadCount.result} />
		</div>
	);
});