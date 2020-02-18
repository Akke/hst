import React from "react";
import loadable from "@loadable/component";
import offerService from "../../services/offerService";
import { FilterContext } from "../../context/filter";
import News from "../News/List/List";
import {
    Row,
    Col,
    CustomInput,
    FormGroup,
    Input,
    Button,
    ButtonGroup
} from "reactstrap";

import { Loader } from "react-feather";

import "./_List.scss";
import OfferSorting from "../Sorting/Offer/Offer";
import Selling from "./Selling/Selling";

const LoadingPage = loadable(() => import("../../LoadingPage"));
const rowCount = 20; // The amount of items to show

export default class Offer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            offers: [],
            skip: rowCount, // skip and limit has to be the same
            limit: rowCount, // Default value
            noMoreResults: true,
            loading: false,
            mode: "sc",
            region: "ALL",
            sort: "desc",
            filterPromise: null,
            autoRefresh: true,
            autoRefreshDisabled: false
        };

        this.getOffers = this.getOffers.bind(this);
        this.loadMoreOffers = this.loadMoreOffers.bind(this);
        this.onFilterUpdated = this.onFilterUpdated.bind(this);
        this.onAutoRefreshChanged = this.onAutoRefreshChanged.bind(this);
        this.sortOnChanged = this.sortOnChanged.bind(this);
    }

    componentDidMount() {
        this.getOffers();
    }

    async shouldComponentUpdate(nextProps, nextState) { 
        if(this.state.skip !== nextState.skip) {
            if(this.state.noMoreResults) return;

            offerService.getAll(this.state.skip, this.state.limit, this.state.mode, this.state.region, this.state.minPrice, this.state.maxPrice, this.state.sort)
                .then((res) => {
                    const offers = this.state.offers.concat(res.offers);

                    this.setState({
                        offers: offers, 
                        noMoreResults: res.offers.length < this.state.limit
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
            // Called when updating the filter.
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

    async onAutoRefreshChanged() {
        this.setState({ autoRefresh: !this.state.autoRefresh });

        if(!this.state.autoRefresh) {
            this.setState({ loading: true, autoRefreshDisabled: true });
            await this.onFilterUpdated();

            setTimeout(() => {
                this.setState({ autoRefreshDisabled: false });
            }, 1000);
        }
    }

    async onFilterUpdated() {
        let res = offerService.getAll(0, this.state.limit, this.state.mode, this.state.region, this.state.minPrice, this.state.maxPrice, this.state.sort)
            .then((data) => {
                this.setState({ 
                    offers: data.offers,
                    noMoreResults: data.offers.length < this.state.limit
                }, () => {
                    this.setState({ loading: false });
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    async getOffers() {
        let res = await offerService.getAll(0, this.state.limit);

        this.setState({
            offers: res.offers,
            noMoreResults: false
        });
    }

    loadMoreOffers() {
        if(this.state.loading) return;

        this.setState({
            skip: this.state.skip + rowCount
        });
    }

    sortOnChanged(e) {
        this.setState({ sort: e.target.dataset.value });
    }

    render() {
        return (
            <div>
                <OfferSorting />

                <div className="wrapper">
                    <div className="container">
                        {this.state.offers.length < 1 ? "No more results." : 
                        (
                            <div className="offer-container">
                                <div>
                                    <Row>
                                        <Col className="d-flex">
                                            <h4 className="mt-2 mb-4 text-white">Most Recent Offers</h4>

                                            <FormGroup className="ml-3" check inline>
                                                <div style={{maxHeight: "1.25rem"}}>
                                                    <CustomInput type="checkbox" id="autoRefreshRadio1" name="autoRefresh" label="Auto Refresh Offers" checked={this.state.autoRefresh} onChange={this.onAutoRefreshChanged} disabled={this.state.autoRefreshDisabled} />
                                                </div>
                                            </FormGroup>

                                            <ButtonGroup className="sort-button-group">
                                                <Button className={this.state.sort == "desc" ? "active" : ""} data-value="desc" onClick={this.sortOnChanged} disabled={this.state.autoRefreshDisabled}>Sort by Newest</Button>
                                                <Button className={this.state.sort == "asc" ? "active" : ""} data-value="asc" onClick={this.sortOnChanged} disabled={this.state.autoRefreshDisabled}>Sort by Oldest</Button>
                                            </ButtonGroup>
                                        </Col>

                                        <Col lg="3"></Col>
                                    </Row>
                                </div>

                                <Row>
                                    <Col>
                                        <Selling 
                                            sort={this.state.sort} 
                                            autoRefresh={this.state.autoRefresh} 
                                            loading={this.state.loading} 
                                            offers={this.state.offers} 
                                            filter={this.props.filter} 
                                            allItems={this.props.equipment} 
                                            skip={this.state.skip} 
                                            limit={this.state.limit} 
                                        />
                                        

                                        {!this.state.loading ? !this.state.noMoreResults ? (
                                            <button className="btn btn-dark w-100 mt-4 mb-2 load-offers-more" style={{"display": (this.state.noMoreResults ? "none" : "block")}} onClick={this.loadMoreOffers}>
                                                {(this.state.loading ? <Loader className="feather" /> : (
                                                    "Load More"
                                                ))}
                                            </button>
                                        ) : null : null}
                                    </Col>
                                    
                                    <News />
                                </Row>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}