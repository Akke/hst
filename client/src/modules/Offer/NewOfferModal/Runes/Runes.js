import React from "react";
import ReactDOM from "react-dom";
import {
	FormGroup,
	Label,
	Button, 
	Modal, 
	ModalHeader, 
	ModalBody, 
	ModalFooter,
	InputGroup,
	Input,
	FormFeedback,
	FormText
} from "reactstrap";

import Select, { components } from "react-select";
import chroma from "chroma-js";
import FormToast from "../../../FormToast/FormToast";

const runeColorStyles = {
	control: (styles, state) => ({
		...styles,
		backgroundColor: "white",
		border: state.isFocused ? "1px solid #80bdff" : "1px solid #dee1e4",
		boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : "none",
		outline: "0",

		"&:hover": {
			borderColor: "#80bdff"
		}
	}),
	option: (styles, {
		data,
		isDisabled,
		isFocused,
		isSelected
	}) => {
		const color = chroma(data.color);
		return {
			...styles,
			backgroundColor: isDisabled ?
				null :
				isSelected ?
				data.color :
				isFocused ?
				color.alpha(0.1).css() :
				null,
			color: isDisabled ?
				"#ccc" :
				isSelected ?
				chroma.contrast(color, "white") > 2 ?
				"white" :
				"black" :
				data.color,
			cursor: isDisabled ? "not-allowed" : "default",

			":active": {
				...styles[":active"],
				backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
			},
		};
	},
	multiValue: (styles, {
		data
	}) => {
		const color = chroma(data.color);
		return {
			...styles,
			backgroundColor: color.alpha(0.1).css(),
		};
	},
	multiValueLabel: (styles, {
		data
	}) => ({
		...styles,
		color: data.color,
	}),
	multiValueRemove: (styles, {
		data
	}) => ({
		...styles,
		color: data.color,
		":hover": {
			backgroundColor: data.color,
			color: "white",
		},
	}),
	indicatorSeparator: (provided, state) => ({
		...provided,
		backgroundColor: "#ced4da"
	})
};

export default class Runes extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isModalOpen: false,
			runeMultiValue: [],
			selectedRune: null,
			singleRuneAmount: 1,
			selectedRunesCount: 0,

			isFormToastOpen: false,
			formToastHeader: null,
			formToastBody: null,

			runeSatanic: [
				{ value: "1", label: "Wii", color: "#F00", amount: "0" },
			],
			runeRare: [
				 { value: "2", label: "Sal", color: "#b79f1b", amount: "0" }
			],
			runeCommon: [
				{ value: "4", label: "Nut", color: "#000", amount: "0" }
			],
			runeGem: [
				{ value: "3", label: "Amethyst", color: "#000", amount: "0" }
			]
		};

		this.onRuneSelect = this.onRuneSelect.bind(this);
		this.onModalClosed = this.onModalClosed.bind(this);
		this.toggleModal = this.toggleModal.bind(this);
		this.onRuneAmountSave = this.onRuneAmountSave.bind(this);
		this.setRuneAmount = this.setRuneAmount.bind(this);
		this.enterKeyOnRuneAmountSave = this.enterKeyOnRuneAmountSave.bind(this);
		this.customMultiValueLabel = this.customMultiValueLabel.bind(this);
		this.formToastToggle = this.formToastToggle.bind(this);

		this.getSelectedRunes = this.getSelectedRunes.bind(this);
	}

	componentDidMount() {
		this.setState({
			runeGroupedOptions: [
				{
					label: "Satanic",
					options: this.state.runeSatanic
				},
				{
					label: "Rare",
					options: this.state.runeRare
				},
				{
					label: "Common",
					options: this.state.runeCommon
				},
				{
					label: "Gems",
					options: this.state.runeGem
				}
			]
		});
	}

	getSelectedRunes() {
		return this.state.runeMultiValue;
	}

	/**
	* Error Handling alert
	*/
	formToastToggle(header, body) {
		this.setState({ 
			isFormToastOpen: !this.state.isFormToastOpen,
			formToastHeader: header,
			formToastBody: body
		});

		setTimeout(() => {
			this.setState({ 
				isFormToastOpen: !this.state.isFormToastOpen,
			});
		}, 5000);
		//TODO: Make it so it shows over any overlay regardless of position....
	}

	toggleModal() {
		this.setState({
			isModalOpen: !this.state.isModalOpen
		})
	}

	onModalClosed() {
		this.setState({
			selectedRune: null,
			singleRuneAmount: 1,
			isFormToastOpen: false
			//selectedRunesCount: 0 <- should be set in the main modal and not socket amount modal?
		})
	}

	onRuneSelect(allSelectedRunes, state) {
		if(state.action != "remove-value") {
			if(this.state.selectedRunesCount > 5) {
				return this.formToastToggle("An error occurred!", "You have exceeded the maximum socket cap of (6).");
			}

	    	this.setState(data => {
				return {
					runeMultiValue: allSelectedRunes,
					isModalOpen: true,
					selectedRune: state.option.value
				};
			});
		}

		if(state.action == "remove-value") {
			const removeFromRunes = this.state.runeMultiValue.filter((obj) => {
				return obj.value !== state.removedValue.value;
			});

			this.setState({
				runeMultiValue: removeFromRunes,
				selectedRunesCount: this.state.selectedRunesCount - parseInt(state.removedValue.amount)
			});
		}
    }

    setRuneAmount(e) {
    	this.setState({
    		singleRuneAmount: parseInt(e.currentTarget.value)
    	})
    }

    enterKeyOnRuneAmountSave(e) {
    	if(e.key === "Enter") {
    		this.onRuneAmountSave();
    	}
    }

	customOption({ children, ...props }) {
		return (
			<components.Option {...props}>
				<img src="/images/test_rune.png" className="inlineItem" />
				{children}
			</components.Option>
		);
	};

	customMultiValueLabel({ children, ...props }) {
		let runeAmount = 0;

		for(const rune of this.state.runeMultiValue) {
			if(rune.value == props.data.value) {
				runeAmount = rune.amount;
			}
		}

		return (
			<components.MultiValueLabel {...props}>
				<img src="/images/test_rune.png" className="inlineItemLabel" />
				{children}

				{(runeAmount > 0 ? <div className='font-weight-bold d-inline'> (x{runeAmount})</div> : "")}
			</components.MultiValueLabel>
		);
	};

	onRuneAmountSave() {
		const runeId = this.state.selectedRune;
		const amountSelected = this.state.singleRuneAmount;

		if(amountSelected < 0 || isNaN(amountSelected)) {
			return this.formToastToggle("An error occurred!", "The amount is invalid: It must be more than 0.");
		}

		if(runeId && runeId > 0) {
			for(const rune of this.state.runeMultiValue) {
				if(rune.value == runeId) {
					this.setState({
						selectedRunesCount: this.state.selectedRunesCount += amountSelected
					});

					if(this.state.selectedRunesCount > 6) {
						this.setState({
							selectedRunesCount: 0
						});

						return this.formToastToggle("An error occurred!", "You have exceeded the maximum socket cap of (6).");
					}

					rune.amount = amountSelected;
				}
			}
		}

		this.toggleModal();
	}

    render() {
    	const closeBtn = <div></div>;

    	//TODO: Possible close buttons for the rune amount modal? So you're not forced to click save > X.
    	// this means resetting all states etc
    	//TODO: how to pass value to the main modal from runes?

    	return (
    		<div>
    			<FormToast 
					isOpen={this.state.isFormToastOpen} 
					toggle={this.formToastToggle} 
					header={this.state.formToastHeader}
					body={this.state.formToastBody}
					className="site-alert site-alert-simple site-alert-danger" 
				/>

	    		<Modal 
					isOpen={this.state.isModalOpen} 
					toggle={this.toggleModal} 
					className="modal-new-offer" 
					centered={true} 
					onClosed={this.onModalClosed}
					backdrop="static"
					autoFocus={false}
				>
					<ModalHeader toggle={this.toggleModal} close={closeBtn}>Enter the Amount</ModalHeader>
					<ModalBody>
						<FormGroup>
							<Label className="font-weight-bold">Amount</Label>
							<InputGroup>
								<Input autoFocus type="number" name="sockets" min="1" max="6" valid={false} invalid={false} placeholder="1" defaultValue="1" onChange={this.setRuneAmount} onKeyDown={this.enterKeyOnRuneAmountSave} />
							</InputGroup>
							<FormFeedback valid={false} invalid={false.toString()}></FormFeedback>
							<FormText>Specify how many sockets you're using this rune/gem in.</FormText>
						</FormGroup>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" type="button" onClick={this.onRuneAmountSave}>Save</Button>{" "}
					</ModalFooter>
				</Modal>

	    		<FormGroup>
					<Label className="font-weight-bold">Runes/Gems</Label>
					<Select
						placeholder="Select socketed runes/gems..."
						isMulti
						name="colors"
						value={this.state.runeMultiValue}
						options={this.state.runeGroupedOptions}
						className="basic-multi-select"
						classNamePrefix="select"
						onChange={this.onRuneSelect}
						styles={runeColorStyles}
						components={{ Option: this.customOption, MultiValueLabel: this.customMultiValueLabel }}
					/>
				</FormGroup>
			</div>
    	);
    }
}