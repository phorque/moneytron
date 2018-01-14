import React from 'react';
import moment from "moment";
import FlatButton from 'material-ui/FlatButton';
import { ListItem } from 'material-ui/List';
import ArrowDropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ArrowDropUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import Divider from 'material-ui/Divider';
import { deepPurple100 } from 'material-ui/styles/colors';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { setSelectedVariation } from "../actions/variations";
import { spreadToText } from "../utils/dates";
import { computeDailyAmount } from "../utils/variations";
import translations from "../translations";

const directionIcon = (variation) => {
  if (variation.direction === "spending") {
    return (<ArrowDropDownIcon color="red" />)
  } else {
    return (<ArrowDropUpIcon color="green" />)
  }
}

const VariationItemAmount = (props) => {
  return (
    <span>
      <span>{new Intl.NumberFormat(props.locale, { style: 'currency', currency: props.currency }).format(props.variation.amount)}</span>
      <div
        style={{
          fontSize: "0.7em",
          color: "#444",
          paddingLeft: 3,
          float: "right",
          textAlign: "right"
        }}
      >
        <div>
          {`${new Intl.NumberFormat(props.locale, { style: 'currency', currency: props.currency }).format(computeDailyAmount(props.variation))}/d.`}
        </div>
        <div>
          {
            props.variation.frequency === "one-time" && translations[props.locale].untilEndOfTheMonth
          }
        </div>
      </div>
    </span>
  );
}

const VariationItem = (props) => {
  return (
    <div>
      <ListItem
        style={props.isSelected ? { background: deepPurple100 } : {}}
        onClick={() => props.isSelected ? props.setSelectedVariation(null) : props.setSelectedVariation(props.variation.uuid)}
        primaryText={VariationItemAmount(props)}
        secondaryText={
          <p
            style={{
              fontSize: "0.7em",
              marginTop: 2,
              fontWeight: "bold"
            }}
          >
            {props.variation.label}
          </p>
        }
        leftIcon={directionIcon(props.variation)}
      />
      <Divider />
    </div>
  );
};

function mapStateToProps(state, props) {
  return ({
    configuration: state.configuration,
    isSelected: (state.selectedVariation === props.variation.uuid),
    currency: state.configuration.currency,
    locale: state.configuration.locale
  });
}

function mapDispatchToProps(dispatch) {
  return ({
    setSelectedVariation: (uuid) => dispatch(setSelectedVariation(uuid))
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(VariationItem);