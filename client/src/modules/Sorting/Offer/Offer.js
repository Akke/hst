import React, { useState } from "react";
import { 
    Button, 
    Modal, 
    ModalHeader, 
    ModalBody, 
    ModalFooter,
    Form, 
    FormGroup, 
    Label, 
    Input, 
    FormFeedback, 
    FormText,
    Col,
    Row,
    CustomInput,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Toast, 
    ToastBody, 
    ToastHeader
} from "reactstrap";

import { FilterContext, filter } from "../../../context/filter";

import "./_Offer.scss";

const SortOptions = (props) => {
    return (
        <div className="offer-sorting">
            <div className="container">
                <Row>
                    <Col lg="2">
                        <Row>
                            <Col xs="6">
                                <FormGroup check inline>
                                    <div>
                                        <CustomInput type="radio" id="sortModeRadio1" name="sortMode" label="" data-mode="sc" onChange={props.onChange} checked={props.currentMode == "sc" ? true : false} disabled={props.loading} />
                                    </div>
                                </FormGroup>
                            </Col>

                            <Col xs="6">
                                <FormGroup check inline>
                                    <div>
                                        <CustomInput type="radio" id="sortModeRadio2" name="sortMode" label="" data-mode="hc" onChange={props.onChange} checked={props.currentMode == "hc" ? true : false} disabled={props.loading} />
                                    </div>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>

                    <Col lg="3" className="ml-auto">
                        <Row>
                            <Col className="pr-1">
                                <FormGroup inline>
                                    <Input type="number" className="mr-sm-2" data-min placeholder="Min Price" onBlur={props.onBlur} onChange={props.onChange} disabled={props.loading} />
                                </FormGroup>
                            </Col>

                            <Col className="pl-1">
                                <FormGroup inline>
                                    <Input type="number" className="mr-sm-2" data-max placeholder="Max Price" onBlur={props.onBlur} onChange={props.onChange} disabled={props.loading} />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>

                    <Col lg="2">
                        <FormGroup>
                            <Input type="select" name="sortRegion" data-region onChange={props.onChange} disabled={props.loading}>
                                <option value="ALL">International (All)</option>
                                <option value="EU">Europe</option>
                                <option value="CH">China</option>
                            </Input>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default class OfferSorting extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        this.timeout = null;
        this.priceTimer = null;
        this.priceDoneTypingInterval = 750;
        this.oldPrice = null;

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e, updateFilter) {
        const evTarget = e.target,
            evType = e.type;

        if(e.target.type != "number") {
            updateFilter(e, (target) => {
                this.setState({ loading: true });
                clearTimeout(this.timeout);

                this.timeout = setTimeout(() => {
                    this.setState({ loading: false });
                }, 1000);
            });
        } else {
            clearTimeout(this.priceTimer);

            if(evType == "blur") {
                if(evTarget.value.length < 1 || this.oldPrice == evTarget.value) return;
                this.setState({ loading: true });
            } 

            this.priceTimer = setTimeout(() => {
                updateFilter(evTarget, (target) => {
                    this.setState({ loading: true });
                    clearTimeout(this.timeout);

                    this.oldPrice = evTarget.value;

                    this.timeout = setTimeout(() => {
                        this.setState({ loading: false });
                    }, 1000);
                });
            }, this.priceDoneTypingInterval);
        }
    }

    render() {
        return (
            <FilterContext.Consumer>
            {({filter, updateFilter}) => (
                <SortOptions onBlur={(e) => this.handleChange(e, updateFilter) } onChange={(e) => this.handleChange(e, updateFilter) } currentMode={filter.mode} loading={this.state.loading} />
            )}
            </FilterContext.Consumer>
        );
    }
}