import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import "./_Hero.scss";

import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import { Search } from "react-feather";
import LoadingPage from "../../LoadingPage";
import offerService from "../../services/offerService";
import equipmentService from "../../services/equipmentService";

export default class Hero extends React.Component {
    constructor(props) {
        super(props);

        this.dropdown = React.createRef();

        this.state = {
            items: [],
            tempItems: [],
            orders: [],
            itemTypes: [],
            empty: false,
            dropdownOpen: false,
            loading: true,
            equipment: null
        };

        this.onSearch = this.onSearch.bind(this);
        this.toggle = this.toggle.bind(this);
        this.hideDropdown = this.hideDropdown.bind(this);
    }

    async componentDidMount() {
        let items = await equipmentService.getAll();
        this.setState({
            equipment: items
        }); 

        offerService.getAll(0, 0)
            .then((data) => {
                equipmentService.getTypes()
                    .then((types) => {
                        this.setState({ orders: data.offers, empty: true, loading: false, itemTypes: types });
                    })
                    .catch((error) => {
                        return console.error(error);
                    });
            })
            .catch((error) => {
                return console.error(error);
            });
    }

    toggle(e) {
        if (this.state.dropdownOpen && (e.target === this.dropdown.current || this.dropdown.current.contains(e.target))) return;
        
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    hideDropdown() {
        this.setState({ 
            dropdownOpen: false
        });
    }

    onSearch(e) {
        this.setState({ empty: false });

        this.state.equipment.forEach((item) => {
            if(!this.state.items.includes(item) && item.name.toLowerCase().includes(e.target.value.toLowerCase())) {
                if(!this.state.empty) this.setState({ empty: true });

                this.state.items.push(item);
            } else if(!item.name.toLowerCase().includes(e.target.value.toLowerCase())) {
                const index = this.state.items.indexOf(item);

                if(index !== -1) this.state.items.splice(index, 1);
            }

            if(e.target.value.length < 1) {
                this.setState({
                    items: []
                });
            }
        });
    }

    countOrders(item) {
        return this.state.orders.reduce(function(n, val) {
            return n + (val.item.value == item);
        }, 0);
    }

    countAuctions(item) {
        return this.state.orders.reduce(function(n, val) {
            return (val.bidding && val.item.value == item) ? n + 1 : n;
        }, 0);
    }

    renderItem(item) {
        const type = this.state.itemTypes.find(type => type.id == item.type_id);

        return (
            <DropdownItem key={item._id} tag={Link} to={`/items/${item.id}`} onClick={this.hideDropdown}>
                <div className="gear-listing">
                    <div className="equipment-image">
                        <div style={{backgroundImage: `url("/images/equipment/${item.name}.png")`}} />
                    </div>

                    <div>
                        <div className={"font-weight-bold " + (item.quality_id == "1" ? "text-danger" : item.quality_id == "2" ? "text-success" : "text-angelic")}>
                            {item.name}
                        </div>
                        <div className="text-muted">{type.name}</div>
                        <div className="pt-2">
                            <span className="badge badge-pill badge-dark mr-1">3 Sellers</span>
                            <span className="badge badge-pill badge-dark mr-1">{this.countOrders(item.id)} Orders</span>
                            <span className="badge badge-pill badge-warning">{this.countAuctions(item.id)} Auctions</span>
                        </div>
                    </div>
                </div>
            </DropdownItem>
        );
    }

    render() {
        return (
            <div className="hero jumbotron d-flex align-items-center vertical-center text-center mb-0">
                <div className="container">
                    <div className="input-group input-group-lg" ref={this.dropdown}>
                        <Search className="feather search-icon" />

                        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle tag="div">
                                <input type="text" onChange={this.state.equipment ? this.onSearch : null} autoComplete="off" className="form-control rounded" placeholder="Enter an item name to search the market for offers..." aria-describedby="inputGroup-sizing-lg" aria-label="Search" role="button" id="heroItemSearch" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" spellCheck="false" />
                            </DropdownToggle>

                            <DropdownMenu className="dropdown-hero-item-search fade">
                                <DropdownItem header>Items</DropdownItem>
                                {this.state.items.length > 0 ? (
                                    this.state.items.map(item => this.renderItem(item))
                                ) : this.state.empty ? (
                                    <div className="text-item">Begin typing the name of the item that you're looking for to search.</div>
                                ) : this.state.loading ? (
                                    <LoadingPage text={true} />
                                ) : (
                                    <div className="text-item">We couldn't find what you're looking for.</div>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        );
    }
}