import React from "react";
import loadable from "@loadable/component";
import {
	ListGroup,
	ListGroupItem
} from "reactstrap";

import { MessageCircle } from "react-feather";
import { userContext } from "../../../context/user";
import userService from "../../../services/userService";

const ActiveRoom = loadable(() => import("../ActiveRoom/Room")),
	LoadingPage = loadable(() => import("../../../LoadingPage"));

export default class Rooms extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			roomId: null,
			recipient: [], // The other user
			recipients: [], // Both users
			listOpen: true
		};
	}

	shouldComponentUpdate(nextProps, nextState) { 
		if(this.props.listOpen !== nextProps.listOpen) {
			this.setState({ 
				listOpen: nextProps.listOpen
			});
		}

		return true;
	}

	componentDidMount() {
		if(this.props.rooms.length > 0) {
			for(const room of this.props.rooms) {
				const recipientId = room.users.find(id => id != this.context.user.id);

				userService.getOne(recipientId).then(data => {
					this.setState({
						recipient: this.state.recipient.concat(data)
					});
				})
			}
		}
	}

	onRoomOpened(id, recipients) {
		const otherUser = recipients.find(user => user != this.context.user.id);

		this.setState({
			roomId: id,
			recipients: this.state.recipient.filter(user => user._id === otherUser).concat(this.context.user)
		}, () => {
			this.setState({ listOpen: false });
			this.props.hideList();
		});
	}

	renderRooms(room) {
		const recipients = this.state.recipient.find(user => room.users.includes(user._id));
		if(!recipients) return null;

		return (
			<ListGroupItem tag="a" href="#" data-unread="3" action key={room._id} onClick={this.onRoomOpened.bind(this, room._id, room.users)}>
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
		if(this.props.rooms.length < 1) return <LoadingPage />;

		if(!this.state.listOpen && (this.state.roomId && this.state.recipients)) return <ActiveRoom id={this.state.roomId} recipients={this.state.recipients} />;
		else
			return (
				<ListGroup className="recipients">
					{this.props.rooms.map(room => this.renderRooms(room))}
				</ListGroup>
			);
	}
}

Rooms.contextType = userContext;