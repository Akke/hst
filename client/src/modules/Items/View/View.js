import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import loadable from "@loadable/component";
import equipmentService from "../../../services/equipmentService";
import offerService from "../../../services/offerService";
import LoadingPage from "../../../LoadingPage";
import OfferSorting from "../../Sorting/Offer/Offer";
import Selling from "../../Offer/Selling/Selling";
import Loading from "../../Offer/Selling/Loading";
import { ThumbsUp, ThumbsDown, Minus, MoreHorizontal, Loader } from "react-feather";
import "./_View.scss";

const Details = loadable(() => import("./Details/Details"));
const rowCount = 20; // The amount of items to show

export default class View extends React.Component {
    constructor(props) {
        super(props);

        this.param = this.props.match.params.item;

        this.state = {
            items: null,
            types: null,
            offers: null,
            skip: 0,
            limit: rowCount,
            mode: this.props.filter.mode,
            region: "ALL",
            sort: "desc",
            noMoreResults: true
        };

        this.onFilterUpdated = this.onFilterUpdated.bind(this);
        this.loadMoreOffers = this.loadMoreOffers.bind(this);
    }

    async shouldComponentUpdate(nextProps, nextState) { 
        if(this.state.skip !== nextState.skip) {
            if(this.state.noMoreResults) return;

            offerService
                .getAll(
                    nextState.skip, 
                    this.state.limit, 
                    this.state.mode, 
                    this.state.region, 
                    this.state.minPrice, 
                    this.state.maxPrice, 
                    this.state.sort, 
                    this.state.items[0].id
                )
                .then((res) => {
                    const offers = this.state.offers.concat(res);

                    this.setState({
                        offers: offers, 
                        noMoreResults: res.length < this.state.limit
                    });
                }).catch((err) => {
                    console.log(err);
                });
        }

        if(this.state.sort !== nextState.sort) {
            this.setState({ 
                loading: true,
                autoRefreshDisabled: true
            }, () => {
                this.onFilterUpdated();
                setTimeout(() => {
                    this.setState({ autoRefreshDisabled: false });
                }, 1000);
            });
        }

        if(this.props.filter !== nextProps.filter) {
            this.setState({ 
                mode: nextProps.filter.mode, 
                region: nextProps.filter.region, 
                minPrice: nextProps.filter.minPrice,
                maxPrice: nextProps.filter.maxPrice,
                loading: true, 
                skip: rowCount
            }, () => {
                this.onFilterUpdated();
            });
        }

        return true;
    }

    async componentDidMount() {
        const items = await equipmentService.getOne(this.param),
            types = await equipmentService.getTypes(),
            offers = await offerService
                .getAll(
                    0, 
                    this.state.limit, 
                    this.state.mode, 
                    this.state.region, 
                    this.state.minPrice, 
                    this.state.maxPrice, 
                    this.state.sort, 
                    items[0].id
                )

        this.setState({
            items: items,
            types: types,
            offers: offers,
            noMoreResults: false
        });
    }

    async onFilterUpdated() {
        let res = offerService
            .getAll(
                0, 
                this.state.limit, 
                this.state.mode, 
                this.state.region, 
                this.state.minPrice, 
                this.state.maxPrice, 
                this.state.sort, 
                this.state.items[0].id
            )
            .then((data) => {
                this.setState({ 
                    offers: data,
                    noMoreResults: data.length < this.state.limit
                }, () => {
                    this.setState({ loading: false });
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    loadMoreOffers() {
        if(this.state.loading) return;

        this.setState({
            skip: this.state.skip + rowCount
        });
    }

    render() {
        if(!this.state.offers || !this.state.items) {
            return (
                <div className="wrapper">
                    <LoadingPage />
                </div>
            );
        }

        const items = this.state.items,
            type = this.state.types.filter(type => type.id == items[0].type_id)[0];

        return (
            <div>
                <Details items={items} type={type} param={this.param} />
                <OfferSorting />

                <div className="wrapper">
                    <div className="container">
                        {this.state.offers.length < 1 ? "No more results." : (
                            <Selling 
                                sort={this.state.sort} 
                                autoRefresh={false} 
                                loading={!this.state.offers} 
                                offers={this.state.offers} 
                                filter={this.props.filter} 
                                allItems={this.props.items} 
                                skip={this.state.skip} 
                                limit={this.state.limit} 
                                itemView={true}
                            />
                        )}

                        {!this.state.loading ? !this.state.noMoreResults ? (
                            <button className="btn btn-dark w-100 mt-4 load-offers-more" style={{"display": (this.state.noMoreResults ? "none" : "block")}} onClick={this.loadMoreOffers}>
                                {(this.state.loading ? <Loader className="feather" /> : (
                                    "Load More"
                                ))}
                            </button>
                        ) : null : null}
                    </div>
                </div>
            </div>
        );
    }
}