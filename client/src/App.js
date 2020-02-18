import React from "react";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import loadable from "@loadable/component";
import axios from "axios";
import { FilterContext, filter } from "./context/filter";
import { userContext } from "./context/user";
import { DbContext } from "./context/db";
import socketableService from "./services/socketableService";
import moment from "moment";

import "bootswatch/dist/darkly/bootstrap.min.css"; 
import "./_App.scss";

const Navigation = loadable(() => import("./modules/Nav/Nav")),
    Hero = loadable(() => import("./modules/Hero/Hero")),
    NewOfferButton = loadable(() => import("./modules/Offer/NewOfferButton/Button")),
    NotFound = loadable(() => import("./modules/ErrorPages/404/404")),
    LoadingPage = loadable(() => import("./LoadingPage")),
    AsyncOffer = loadable(() => import("./modules/Offer/List")),
    AsyncViewItem = loadable(() => import("./modules/Items/View/View")),
    Login = loadable(() => import("./modules/Auth/Login")),
    Logout = loadable(() => import("./modules/Auth/Logout")),
    Footer = loadable(() => import("./modules/Footer/Footer"));

export default class App extends React.Component {
    _user = { user: JSON.parse(localStorage.getItem("user")) };

    constructor(props) {
        super(props);

        this.updateFilter = (e, cb) => {
            let target;

            if(e.hasOwnProperty("target")) target = e.target; else target = e;

            if(target.dataset.hasOwnProperty("mode")) this.setState({ _mode: target.dataset.mode });
            if(target.dataset.hasOwnProperty("region")) this.setState({ _region: target.value });
            if(target.dataset.hasOwnProperty("min")) this.setState({ _minPrice: (target.value.length > 0) ? target.value : filter.minPrice });
            if(target.dataset.hasOwnProperty("max")) this.setState({ _maxPrice: (target.value > 0) ? target.value : filter.maxPrice });

            this.setState(
                state => ({
                    filter: Object.assign({}, {
                        mode: target.dataset.hasOwnProperty("mode") ? target.dataset.mode : this.state._mode,
                        region: target.dataset.hasOwnProperty("region") ? target.value : this.state._region,
                        minPrice: target.dataset.hasOwnProperty("min") ? ((target.value.length > 0) ? target.value : filter.minPrice) : this.state._minPrice,
                        maxPrice: target.dataset.hasOwnProperty("max") ? ((target.value.length > 0) ? target.value : filter.maxPrice) : this.state._maxPrice
                    })
                }), () => {
                    if(cb) cb(target);
                }
            );
        };

        this.state = {
            filter: filter,
            updateFilter: this.updateFilter,
            equipment: [],
            dbContext: null,
            /* Local Variables */
            _mode: filter.mode,
            _region: filter.region,
            _minPrice: filter.minPrice,
            _maxPrice: filter.maxPrice,
        };

        socketableService.getAll().then(socketables => {
            socketableService.getTypes().then(socketableTypes => {
                const dbContext = {
                    socketables: {
                        items: socketables,
                        types: socketableTypes
                    }
                };

                this.setState({
                    dbContext: dbContext
                });
            })
            .catch(e => console.error);
        })
        .catch(e => console.error);
    }

    componentDidMount() {
        document.title = "HS Trade";
        axios.get("/api/csrf")
            .then(res => {
                axios.defaults.headers.post["X-XSRF-TOKEN"] = res.data; 
            });

        if(moment().diff(moment(localStorage.getItem("expires")), "hours") >= 24) {
            localStorage.removeItem("user");
            localStorage.removeItem("expires");
            window.location.reload();
        }
    }

    render() {
        return (
            <Router>
                <div className="App">
                    <DbContext.Provider value={this.state.dbContext}>
                        <userContext.Provider value={this._user}>
                            <Navigation />
                            <Hero />

                            <FilterContext.Provider value={this.state}>
                                <FilterContext.Consumer>
                                {({filter, updateFilter}) => (
                                    <Switch>
                                        <Route exact path="/items/:item" render={(props) => <AsyncViewItem {...props} fallback={<LoadingPage />} filter={filter} />} />

                                        <Route exact path="/logout" render={(props) => <Logout {...props} fallback={<LoadingPage />} />} />
                                        <Route exact path="/login/verify" render={(props) => <Login {...props} fallback={<LoadingPage />} />} />
                                        <Route exact path="/" render={(props) => <AsyncOffer {...props} fallback={<LoadingPage />} filter={filter} />} />

                                        <Route component={NotFound} status={404} />
                                    </Switch>
                                )}
                                </FilterContext.Consumer>

                                <NewOfferButton />
                            </FilterContext.Provider>

                            <Footer />
                        </userContext.Provider>
                    </DbContext.Provider>
                </div>
            </Router>
        );
    }
}

App.contextType = FilterContext;

