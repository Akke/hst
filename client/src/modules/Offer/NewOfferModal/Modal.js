import React from "react";
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

import Select, { components } from "react-select";

import "./_Modal.scss";

import offerService from "../../../services/offerService";
import FormToast from "../../FormToast/FormToast";
import Runes from "./Runes/Runes";
import Items from "./Items/Items";

const defaultFormObj = {
    mode: null,
    item: null,
    runes: {},
    item: {},
    level: 1,
    quality: 100,
    bidding: false,
    expires: null,
    price: null,
    region: "ALL" // International
};

export default class NewOfferModal extends React.Component {
    constructor(props) {
        super(props);

        this.biddingParent = React.createRef();

        this.state = {
            biddingWarningDisplay: false,
            showFormError: false,
            form: defaultFormObj,
            thumbnail: "",
            thumbnailQuality: null,
            biddingDisabled: false,
            sent: false, // If the user has sent the form already
        };

        this.onClosed = this.onClosed.bind(this);
        this.sendOffer = this.sendOffer.bind(this);
        this.onModeChanged = this.onModeChanged.bind(this);
        this.onLevelChanged = this.onLevelChanged.bind(this);
        this.onQualityChanged = this.onQualityChanged.bind(this);
        this.onBiddingChanged = this.onBiddingChanged.bind(this);
        this.onExpireChanged = this.onExpireChanged.bind(this);
        this.onPriceChanged = this.onPriceChanged.bind(this);
        this.onRegionChanged = this.onRegionChanged.bind(this);
        this.onItemUpdated = this.onItemUpdated.bind(this);
    }

    /*
    * Form Values
    */
    onModeChanged(e) {
        const target = e.currentTarget;
        let value = null;

        if(target.hasAttribute("data-mode-sc")) {
            value = "sc";
        } else if(target.hasAttribute("data-mode-hc")) {
            value = "hc";
        }

        this.setState({
            form: Object.assign(this.state.form, { mode: value })
        });
    }

    onLevelChanged(e) {
        this.setState({
            form: Object.assign(this.state.form, { level: e.currentTarget.value })
        });
    }

    onQualityChanged(e) {
        this.setState({
            form: Object.assign(this.state.form, { quality: e.currentTarget.value })
        });
    }

    onBiddingChanged(e) {
        this.setState({
            form: Object.assign(this.state.form, { bidding: e.target.checked }),
            biddingWarningDisplay: !this.state.biddingWarningDisplay
        });
    }

    onExpireChanged(e) {
        this.setState({
            form: Object.assign(this.state.form, { expires: e.currentTarget.value })
        });
    }

    onPriceChanged(e) {
        this.setState({
            form: Object.assign(this.state.form, { price: e.currentTarget.value })
        });
    }

    onRegionChanged(e) {
        this.setState({
            form: Object.assign(this.state.form, { region: e.currentTarget.value })
        });
    }

    onItemUpdated(item, quality) {
        let className = null;

        switch(quality) {
            case "1":
                className = "thumbnail-satanic";
                break;
            case "2":
                className = "thumbnail-set";
                break;
            case "3":
                className = "thumbnail-angelic";
                break;
        }

        this.setState({ thumbnail: item, thumbnailQuality: className });
    }

    /**
    * Modal
    */
    onClosed() {
        this.setState({
            biddingWarningDisplay: false,
            form: defaultFormObj,
            thumbnail: "",
            thumbnailQuality: null
        });

        this.Toast.toggle();
        setTimeout(() => {
            this.setState({ sent: false });
        }, 1000);
    }

    async sendOffer(event) {
        event.preventDefault();
        if(this.state.sent) return;

        this.setState({ sent: true });
        
        const payload = Object.assign(this.state.form, { runes: this.Runes.getSelectedRunes() }, { item: this.Items.getSelectedItem() }),
            res = await offerService.insertOne(payload);

        if(res.status == 200) {
            this.Toast.display("Thank you!", "Your order has been placed successfully.", "success");
            this.onClosed();
            this.props.toggle();
        } else if(res.status == 400) {
            const keys = Object.keys(res.data.details);

            for(let i = 0, length = keys.length; i < length; i++) {
                this.Toast.display("An error occurred!", res.data.details[keys[i]].message, "danger");
            }

            this.setState({ sent: false });
        } else {
            console.error(res.data);

            this.Toast.display("An error occurred!", "Something went wrong on our end, please contact an administrator for help.", "danger");
            this.setState({ sent: false });
        }
    }

    render() {
        const closeBtn = <button type="button" className="btn btn-danger close" onClick={this.props.toggle}>Close</button>;

        return (
            <div>
                <FormToast ref={(ref) => this.Toast = ref} />
                
                <Modal 
                    isOpen={this.props.isOpen} 
                    toggle={this.props.toggle} 
                    className="modal-new-offer" 
                    centered={true} 
                    onClosed={this.onClosed}
                >
                    <Form onSubmit={this.sendOffer}>
                        <ModalHeader toggle={this.props.toggle} close={closeBtn}>Place Order</ModalHeader>
                        <ModalBody>
                            <Row>
                                <Col>
                                    <legend className="font-weight-bold">Order Mode</legend>
                                    <FormGroup>
                                        <div>
                                            <CustomInput type="radio" id="modeRadio1" name="mode" label="Softcore" onChange={this.onModeChanged} data-mode-sc />
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <div>
                                            <CustomInput type="radio" id="modeRadio2" name="mode" label="Hardcore" onChange={this.onModeChanged} data-mode-hc />
                                        </div>
                                    </FormGroup>
                                </Col>

                                <Col>
                                    <div className={"new-offer-image-thumbnail " + this.state.thumbnailQuality}>
                                        <div style={{ backgroundImage: `url("https://hsbuilds.com/images/equipment/${this.state.thumbnail}.png")` }}></div>
                                    </div>
                                </Col>
                            </Row>

                            <Items ref={(ref) => this.Items = ref} onItemUpdated={this.onItemUpdated} equipment={this.props.equipment} />{/*Must store value in a prop*/}
                            <Runes ref={(ref) => this.Runes = ref} />

                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Label className="font-weight-bold">Item Level</Label>
                                        <InputGroup>
                                            <Input type="number" name="level" min="1" max="10" valid={false} invalid={false} placeholder="1" defaultValue="1" onChange={this.onLevelChanged} />
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>%</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FormFeedback valid={false} invalid={false.toString()}></FormFeedback>
                                        <FormText>Enter a level from 1-10</FormText>
                                    </FormGroup>
                                </Col>

                                <Col>
                                    <FormGroup>
                                        <Label className="font-weight-bold">Item Quality</Label>
                                        <InputGroup>
                                            <Input type="number" name="quality" min="50" max="115" valid={false} invalid={false} placeholder="100" defaultValue="100" onChange={this.onQualityChanged} />
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>%</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FormFeedback valid={false} invalid={false.toString()}></FormFeedback>
                                        <FormText>Enter the quality from 50-115%</FormText>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <FormGroup>
                                <Label className="font-weight-bold">Bidding</Label>
                                <div>
                                    <div className={this.state.biddingDisabled ? "biddingDisabled" : ""}>
                                        <CustomInput innerRef={this.biddingParent} type="switch" id="exampleCustomSwitch" name="bidding" label="Enable Bidding" onChange={this.onBiddingChanged} disabled={this.state.biddingDisabled} />
                                        <FormText 
                                            style={{ display: (this.state.biddingWarningDisplay ? "block" : "none") }}
                                        >

                                            By checking this box your offer will be converted into an auction offer and you will be able to either take bids for up to 36 hours or 
                                            sell it directly for a buyout price. Beware that there are special rules, as per our <a href="/tos">Terms of Service</a>, 
                                            which makes it possible for you to receive <a href="/ok">a negative account status</a> if you don"t properly take care of your auction offer.
                                            
                                            <div className="font-weight-bold"><a href="/ok">Read more about your responsibilities when dealing with auction offers.</a></div>
                                        </FormText>
                                    </div>

                                    {(this.state.biddingWarningDisplay ? 
                                        <Row className="mt-2">
                                            <Col>
                                                <FormGroup>
                                                    <Label className="font-weight-bold">Buyout Price</Label>
                                                    <InputGroup>
                                                        <Input type="number" name="price" min="1" max="999999999" valid={false} invalid={false} placeholder="Buyout price" onChange={this.onPriceChanged} />
                                                        <InputGroupAddon addonType="append">
                                                            <InputGroupText>Rubies</InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    <FormFeedback valid={false} invalid={false.toString()}></FormFeedback>
                                                    <FormText>The bidding will start at 50% of the buyout price. The bidder can choose to bid the full amount to instantly end the auction and buy the item.</FormText>
                                                </FormGroup>
                                            </Col>

                                            <Col>
                                                <FormGroup>
                                                    <Label className="font-weight-bold">Expires In</Label>
                                                    <CustomInput type="select" id="exampleCustomSelect" name="expires" onChange={this.onExpireChanged}>
                                                        <option default>Expiration Time</option>
                                                        <option value="24">24 hours</option>
                                                        <option value="6">6 hours</option>
                                                        <option value="12">12 hours</option>
                                                        <option value="36">36 hours</option>
                                                    </CustomInput>
                                                    <FormFeedback valid={false} invalid={false.toString()}></FormFeedback>
                                                    <FormText>New biddings will be disabled when the auction offer expires, and you have 24 hours to complete the trade.</FormText>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    : 
                                        <FormGroup className="mt-3">
                                            <Label className="font-weight-bold">Item Price</Label>
                                            <InputGroup>
                                                <Input valid={false} invalid={false} placeholder="Price in Rubies" name="price" onChange={this.onPriceChanged} />
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>Rubies</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FormFeedback valid={false} invalid={false.toString()}></FormFeedback>
                                            <FormText>Enter a price in rubies.</FormText>
                                        </FormGroup>
                                    )}
                                </div>
                            </FormGroup>

                            <FormGroup>
                                <Label className="font-weight-bold">Region</Label>
                                <CustomInput type="select" id="exampleCustomSelect" name="region" onChange={this.onRegionChanged}>
                                    <option value="ALL">International (All)</option>
                                    <option value="EU">Europe</option>
                                    <option value="CH">China</option>
                                </CustomInput>
                                <FormFeedback valid={false} invalid={false.toString()}></FormFeedback>
                                <FormText>Choose a region to help us sort your offer. This way you can more easily get people with the same nationality as you to trade with you.</FormText>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" type="submit">Post</Button>{" "}
                            <Button color="secondary" type="button" onClick={this.props.toggle}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </Modal>
            </div>
        );
    }
}