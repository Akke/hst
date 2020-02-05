import React from "react";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import loadable from "@loadable/component";
import axios from "axios";
import equipmentService from "./services/equipmentService";
import { FilterContext, filter } from "./context/filter";
import { userContext } from "./context/user";
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
    Logout = loadable(() => import("./modules/Auth/Logout"));

export default class App extends React.Component {
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

        // State also contains the updater function so it will
        // be passed down into the context provider
        this.state = {
            filter: filter,
            updateFilter: this.updateFilter,
            equipment: [],
            user: {},
            /* Local Variables */
            _mode: filter.mode,
            _region: filter.region,
            _minPrice: filter.minPrice,
            _maxPrice: filter.maxPrice,
        };

        this.getAllItems = this.getAllItems.bind(this);
    }

    async componentDidMount() {
        document.title = "HS Trade";
        axios.get("/api/csrf")
            .then(res => {
                axios.defaults.headers.post["X-XSRF-TOKEN"] = res.data; 
            });

        await this.getAllItems();

        if(moment().diff(moment(localStorage.getItem("expires")), "hours") >= 24) {
            localStorage.removeItem("user");
            localStorage.removeItem("expires");
            window.location.reload();
        }
    }

    async getAllItems() {
        let items = await equipmentService.getAll();
        this.setState({
            equipment: items
        }); 
    }

    render() {
        const user = {
            user: JSON.parse(localStorage.getItem("user"))
        };

        return (
            <Router>
                <div className="App">
                    <userContext.Provider value={user}>
                        <Navigation />
                        <Hero equipment={this.state.equipment} />

                        <FilterContext.Provider value={this.state}>
                            <FilterContext.Consumer>
                            {({filter, updateFilter}) => (
                                <Switch>
                                    <Route exact path="/items/:item" render={(props) => <AsyncViewItem {...props} fallback={<LoadingPage />} />} />

                                    <Route exact path="/logout" render={(props) => <Logout {...props} fallback={<LoadingPage />} />} />
                                    <Route exact path="/login/verify" render={(props) => <Login {...props} fallback={<LoadingPage />} />} />
                                    <Route exact path="/" render={(props) => <AsyncOffer {...props} fallback={<LoadingPage />} filter={filter} equipment={this.state.equipment} />} />

                                    <Route component={NotFound} status={404} />
                                </Switch>
                            )}
                            </FilterContext.Consumer>

                            <NewOfferButton equipment={this.state.equipment} />
                        </FilterContext.Provider>
                    </userContext.Provider>
                </div>
            </Router>
        );
    }
}

App.contextType = FilterContext;

