import React from "react";
import loadable from "@loadable/component";
import chatRoomService from "../../services/chatRoomService";
import "./_Chat.scss";
import { ChevronLeft } from "react-feather";

const Rooms = loadable(() => import("./Rooms/Rooms")),
    LoadingPage = loadable(() => import("../../LoadingPage"));

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rooms: [],
            listOpen: true,
            loading: true
        };

        this.chatContainer = React.createRef();

        this.hideList = this.hideList.bind(this);
    }

    componentDidMount() {
        chatRoomService.getOwnRooms().then((rooms) => {
            this.setState({
                rooms: rooms,
                loading: false
            });
        });

        this.chatContainer.current.parentElement.children[0].addEventListener("click", (e) => {
            if(e.target.classList.contains("active")) {
                this.setState({
                    listOpen: true
                });
            }
        });
    }

    hideList() {
        this.setState({
            listOpen: !this.state.listOpen
        });
    }

    render() {
        return (
            <div className={"chat-container " + (this.props.isOpen ? "open" : "")} ref={this.chatContainer}>
                <div className="header">
                    <h4>Chat</h4>

                    <ChevronLeft className="feather" onClick={this.hideList} style={{"display": !this.state.listOpen ? "block" : "none"}} />
                </div>

                {
                    (this.state.loading || !this.props.unreadRooms) ? <LoadingPage />
                    : this.state.rooms.length > 0 ? <Rooms rooms={this.state.rooms} unreadRooms={this.props.unreadRooms} listOpen={this.state.listOpen} hideList={this.hideList} remoteSetUnreadRooms={this.props.remoteSetUnreadRooms} />
                    : <div className="list-empty">You haven't started any conversations yet.</div>
                }
            </div>
        );
    }
}