import React, { useState, useEffect, useContext, useRef } from "react";
import loadable from "@loadable/component";
import { MessageCircle } from "react-feather";
import chatRoomService from "../../../services/chatRoomService";
import { userContext } from "../../../context/user";
import ReactNotifications from "react-browser-notifications";
import io from "socket.io-client";
import config from "../../../config";
import "./_Chat.scss";

const Chat = loadable(() => import("../../Chat/Chat"));

export default(_ => {
	const socket = io(config.api);
	const [chatOpen, setChatOpen] = useState(false);
	const [unread, setUnread] = useState(null);
	const [unreadRooms, setUnreadRooms] = useState(null);
	const [showNotification, setShowNotification] = useState(false);
	const ctx = useContext(userContext);
	let notRef = useRef(null);

	useEffect(() => {
		let localUnread, localUnreadRooms = null;

		const fetchUnread = async () => {
			const result = await chatRoomService.getUnread();

			setUnreadRooms(result);
			localUnreadRooms = result;

			let count = null;
			if(result.length > 0 && result.length != 1) count = Object.values(result).reduce((a, b) => a.unread + b.unread);	
			if(result.length == 1) count = result[0].unread;

			setUnread(count);
			localUnread = count;
		}

		fetchUnread();
		socket.on(`chat_room_unread_${ctx.user.id}`, (data) => {
			if(document.getElementsByClassName("chat-box").length > 0) return;

			let count = null;

			if(!localUnreadRooms || localUnreadRooms.length < 1) {
				localUnreadRooms = [{ _id: { room: data.room }, unread: data.amount }];
				count = data.amount;
			} else {
				localUnreadRooms.find((r, i) => {
					if(r._id.room == data.room) {
						localUnreadRooms[i].unread += data.amount;
					}
				});

				if(localUnreadRooms.length > 0 && localUnreadRooms.length != 1) count = Object.values(localUnreadRooms).reduce((a, b) => a.unread + b.unread);	
				if(localUnreadRooms.length == 1) count = localUnreadRooms[0].unread;
			}

			setUnreadRooms(localUnreadRooms);
			setUnread(count);
			localUnread = count;

			console.log(notRef)
			if(notRef.supported()) notRef.show();
		});
	}, []);

	// Do ONLY use if you need to set it in another file
	const remoteSetUnreadRooms = obj => {
		setUnreadRooms(obj);

		let count = null;
		if(obj.length > 0 && obj.length != 1) count = Object.values(obj).reduce((a, b) => a.unread + b.unread);	
		if(obj.length == 1) count = obj[0].unread;
		setUnread(count);
	}

	const toggle = () => {
		if(!chatOpen) {
			document.querySelector(".navbar").style.width = document.querySelector(".navbar").offsetWidth - 325 + "px";
		} else {
			document.querySelector(".navbar").style.width = "100%";
		}
		
		setChatOpen(!chatOpen);
	}

	const handleNotificationClick = event => {
		window.focus();
	}

	return (
		<div>
			<div className={"nav-chat" + (chatOpen ? " active" : "")} onClick={toggle} data-unread={unread}>
				<MessageCircle className="feather" />
			</div>

			<Chat isOpen={chatOpen} unreadRooms={unreadRooms} remoteSetUnreadRooms={remoteSetUnreadRooms} />

			<ReactNotifications
		          onRef={ref => (notRef = ref)} // Required
		          title="Unread Message"
		          body="You've received a new chat message! Click here to view it."
		          icon="icon.png"
		          tag="chat"
		          timeout="5000"
		          onClick={event => handleNotificationClick(event)}
		        />
		</div>
	);
});