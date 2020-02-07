import React from "react";
import loadable from "@loadable/component";
import {
	ListGroup,
	ListGroupItem
} from "reactstrap";

import { MessageCircle } from "react-feather";
import { userContext } from "../../../context/user";
import userService from "../../../services/userService";
import chatRoomService from "../../../services/chatRoomService";
import _ from "lodash";

const ActiveRoom = loadable(() => import("../ActiveRoom/Room")),
	LoadingPage = loadable(() => import("../../../LoadingPage"));

export default class Rooms extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			roomId: null,
			recipientPromises: [], 
			recipient: [], // The other user
			recipients: [], // Both users
			listOpen: true
		};
	}

	componentDidMount() {
		for(const room of this.props.rooms) {
			const recipientId = room.users.find(id => id != this.context.user.id);

			const promise = new Promise((resolve, reject) => {
				userService.getOne(recipientId).then(data => {
					resolve(data[0]);
				})
				.catch((error) => {
					reject(error);
				});
			});

			this.state.recipientPromises.push(promise);
		}

		Promise.all(this.state.recipientPromises).then(values => {
			this.setState({
				recipient: this.state.recipient.concat(values)
			});
		});
	}

	shouldComponentUpdate(nextProps, nextState) { 
		if(this.props.listOpen !== nextProps.listOpen) {
			this.setState({ 
				listOpen: nextProps.listOpen
			});
		}

		return true;
	}

	onRoomOpened(id, recipients, timestamp) {
		const otherUser = recipients.find(user => user != this.context.user.id);

		this.setState({
			roomId: id,
			recipients: this.state.recipient.filter(user => user._id === otherUser).concat(this.context.user),
			timestamp: timestamp
		}, async () => {
			this.setState({ listOpen: false });
			this.props.hideList();

			if(this.props.unreadRooms.length > 0) {
				let unreadRooms = this.props.unreadRooms;
				const read = unreadRooms.find((r, i) => {
					if(r._id.room == id) {
						let amount = unreadRooms[i].unread - r.unread;

						if(amount < 1) unreadRooms[i].unread = null;
						else unreadRooms[i].unread -= amount;
					}
				});

				this.props.remoteSetUnreadRooms(unreadRooms);
				await chatRoomService.markAsRead(id);
			}
		});
	}

	renderRooms(room) {
		const recipients = this.state.recipient.find(user => room.users.includes(user._id)),
			unread = this.props.unreadRooms.filter(r => r._id.room === room._id)[0];

		if(!recipients) return null;

		return (
			<ListGroupItem tag="a" href="#" data-unread={unread ? unread.unread : null} action key={room._id} onClick={this.onRoomOpened.bind(this, room._id, room.users, room.createdAt)}>
				<img src={recipients.avatar} />
				<div className="details">
					<div className="recipient-name">{recipients.username}</div>
					<div className="last-message">
						<MessageCircle className="feather" />
						This is an example last message...
					</div>
				</div>
			</ListGroupItem>
		);
	}

	render() {
		if(this.state.recipient.length < 1) return <LoadingPage />;

		if(!this.state.listOpen && (this.state.roomId && this.state.recipients)) return <ActiveRoom id={this.state.roomId} timestamp={this.state.timestamp} recipients={this.state.recipients} />;
		else
			return (
				<ListGroup className="recipients">
					{this.props.rooms.map(room => this.renderRooms(room))}
				</ListGroup>
			);
	}
}

Rooms.contextType = userContext;