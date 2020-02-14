import React from "react";
import {
    FormGroup,
    Label,
    Row,
    Col
} from "reactstrap";

import Select, { components } from "react-select";
import abilityService from "../../../../services/abilityService";

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        border: state.isFocused ? "1px solid #80bdff" : "1px solid #dee1e4",
        boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : "none",
        outline: "0",

        "&:hover": {
            borderColor: "#80bdff"
        }
    }),
    indicatorSeparator: (provided, state) => ({
        ...provided,
        backgroundColor: "#ced4da"
    })
}

export default class Items extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            formValItem: null,
            formValItemAbilityPlaceholder: { value: "0", label: "None" },
            isWeapon: false,
            itemSelect: [],
            itemAbilitySelect: []
        };
        
        this.onItemSelect = this.onItemSelect.bind(this);
        this.onItemAbilitySelect = this.onItemAbilitySelect.bind(this);
    }

    componentDidMount() {
        if(this.state.itemSelect.length < 1) this.mapItems();
        if(this.state.itemAbilitySelect.length < 1) this.getAllAbilities();
    }

    async mapItems() {
        const options = this.props.equipment.map((item) => {
            return { 
                value: item.id, 
                label: item.name, 
                weapon: (parseInt(item.type_id) >= 8) ? true : false, 
                quality: item.quality_id, 
                ability: "0"
            };
        });

        this.setState({
            itemSelect: options
        });
    }

    async getAllAbilities() {
        let abilities = await abilityService.getAll();
        const options = abilities.map((ability) => {
            return { 
                value: ability._id, 
                label: ability.title,
                description: ability.description
            };
        });

        this.setState({
            itemAbilitySelect: options
        });
    }

    onItemSelect(selectedOption) {
        this.setState({
            formValItem: 
                (
                    selectedOption.hasOwnProperty("ability") ? selectedOption : Object.assign(selectedOption, { ability: "0" }) // Set ability to 0 if it's not already set
                ), 
            isWeapon: false, 
            formValItemAbilityPlaceholder: { value: "0", label: "None" }
        });

        if(selectedOption.weapon) {
            this.setState({ isWeapon: true });
        }

        this.props.onItemUpdated(selectedOption.label, selectedOption.quality); // Run the onItemUpdated hook to update the thumbnail
    }

    onItemAbilitySelect(selectedOption) {
        if(this.state.formValItem.weapon) {
            this.setState({ 
                formValItem: 
                    Object.assign(
                        {}, 
                        this.state.formValItem, 
                        {
                            ["ability"]: selectedOption.value != null ? selectedOption.value : null
                        }
                    ),
                formValItemAbilityPlaceholder: selectedOption // This is simply just a placeholder to get the selected value to show up in the select
            });
        }
    }

    getSelectedItem() {
        return this.state.formValItem;
    }

    itemAbilityOption({ children, ...props }) {
        return (
            <components.Option {...props}>
                {children}
                <div className="small">{props.data.description}</div>
            </components.Option>
        );
    };

    render() {
        //TODO: Change the sprite thumbnail when you select an item, and change quality border color.

        return (
            <Row>
                <Col>
                    <FormGroup>
                        <Label className="font-weight-bold">Item</Label>
                        <Select
                            placeholder="Select an item..."
                            value={this.state.formValItem}
                            onChange={this.onItemSelect}
                            options={this.state.itemSelect}
                            isLoading={(this.state.itemSelect.length > 0 ? false : true)}
                            styles={customStyles}
                        />
                    </FormGroup>
                </Col>
                {(this.state.isWeapon ? 
                <Col>
                    <FormGroup>
                        <Label className="font-weight-bold">Item Ability</Label>
                        <Select
                            placeholder="Select an item ability..."
                            value={this.state.formValItemAbilityPlaceholder}
                            onChange={this.onItemAbilitySelect}
                            options={this.state.itemAbilitySelect}
                            styles={customStyles}
                            isLoading={(this.state.itemAbilitySelect.length > 0 ? false : true)}
                            components={{ Option: this.itemAbilityOption }}
                        />
                    </FormGroup>
                </Col>
                : null)}
            </Row>
        );
    }
}