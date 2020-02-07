import React from "react";
import loadable from "@loadable/component";
import { BrowserRouter as Router, Link } from "react-router-dom";
import { Input, Button } from "reactstrap";
import { userContext } from "../../../context/user";
import chatRoomService from "../../../services/chatRoomService";
import io from "socket.io-client";
import moment from "moment";
import _ from "underscore";
import "./_Room.scss";
import config from "../../../config";

/*
TODO:
	- Implement unread count
*/

const LoadingPage = loadable(() => import("../../../LoadingPage")),
	RecipientHeader = loadable(() => import("./RecipientHeader/RecipientHeader"));

export default class Room extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			messages: [],
			originalMessages: [],
			noMessages: false,
			inputMessage: "",
			startDate: null,
			recipient: null,
			showNotification: false,
			notificationTitle: "",
			notificationBody: ""
		};

		this.messagesEnd = React.createRef();

		this.onInputChanged = this.onInputChanged.bind(this);
		this.onMessageSent = this.onMessageSent.bind(this);
		this.renderMessage = this.renderMessage.bind(this);
		this.renderMessageGroup = this.renderMessageGroup.bind(this);
	}

	async componentDidMount() {
		const messages = await chatRoomService.getRoomMessages(this.props.id),
			groups = this.formatMessages(messages);

		this.setState({
			messages: groups,
			originalMessages: messages,
			noMessages: (groups.length < 1) ? true : false,
			startDate: moment.unix(this.props.timestamp).format("YYYY-MM-DD [at] H:mm"),
			recipient: this.props.recipients.filter(id => id != this.context.user.id)[0]
		});

		const socket = io(config.api);
		socket.on(`chat_room_message_${this.props.id}`, (data) => {
			this.setState({
				originalMessages: this.state.originalMessages.concat(data)
			}, () => {
				const groups = this.formatMessages(this.state.originalMessages);

				this.setState({
					messages: groups
				}, () => {
					this.scrollToBottom();
				});
			})
		});

		this.scrollToBottom();
	}

	formatMessages(messages) {
		if(messages.length < 1) return [];

		const formatDate = date => moment(date).format(),
			firstMessage = messages[0];

		const sliceMessages = messages.slice(1).reduce((user, msg) => {
			const lastMessages = user[user.length - 1],
				lastMessage = lastMessages[lastMessages.length - 1];

			if(lastMessage.user == msg.user) {
				lastMessages.push(msg);
				user[user.length - 1] = lastMessages;
			} else {
				user.push([msg]);
			}

			return user;
		}, [[firstMessage]]);



		const groups = sliceMessages.reduce((user, msg) => {
			const message = msg[msg.length - 1],
				timestamp = moment(message.createdAt * 1000).format();

			user[timestamp] = msg;
			user[timestamp].push(message.user);

			return user;
		}, {});

		return groups;
	}

	renderMessageGroup(message) {
		const fromUser = message[1][message[1].length - 1],
			date = message[0];

		let user = this.props.recipients.find(u => u._id == fromUser);
		if(!user) user = this.context.user;
		
		return (
			<li key={date} className="message-list__item">
				<img src={user.avatar} />
				<div className="message-container">
					{Object.values(message[1]).map(obj => this.renderMessage(obj, date))}

					<div className="timestamp">
						{moment(date).fromNow()}
					</div>
				</div>
			</li>
		);
	}

	renderMessage(obj, date) {
		if(typeof obj != "object") return null;
		
		return (
			<div className={"message message-list__item__message " + (obj.user == this.context.user.id ? "message-list__item__message--self" : "")} key={obj._id}>
				{obj.message}
			</div>
		);
	}

	async onMessageSent() {
		const message = this.state.inputMessage;
		if(message.length < 1) return;

		this.setState({ inputMessage: "" });

		await chatRoomService.sendMessage(message, this.props.id);
		
		this.scrollToBottom();
	}

	onInputChanged(e) {
		this.setState({ inputMessage: e.target.value });
	}

	scrollToBottom() {
		this.messagesEnd.scrollIntoView({ behavior: "smooth" });
	}

	render() {
		if(!this.state.startDate || !this.state.recipient._id) return <LoadingPage />;

		return (
			<div className="chat-window">
				<RecipientHeader recipient={this.state.recipient._id} />

				<div className="chat-messages">
					<ul className="message-list">
						{this.state.startDate ? <li className="divider">Conversation started on {this.state.startDate}</li> : null}

						{(this.state.messages.length < 1) ? 
							(this.state.noMessages ? 
								<li className="divider">There is no message history available.</li> 
								: <LoadingPage />
							)
							: Object.entries(this.state.messages).map(this.renderMessageGroup)}
					</ul>

					<div ref={(el) => { this.messagesEnd = el; }} />
				</div>

				<div className="chat-box">
					<Input type="text" name="message" placeholder="Message Akke" spellCheck="false" onChange={this.onInputChanged} onKeyPress={e => (e.key === "Enter") ? this.onMessageSent() : null} value={this.state.inputMessage} autoComplete="off" />
					<Button type="submit" onClick={this.onMessageSent}>Send</Button>
				</div>
			</div>
		);
	}
}

Room.contextType = userContext;