import React from 'react';
import MaterialAppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import Divider from 'material-ui/Divider';
import ArrowDropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ArrowDropUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import Subheader from 'material-ui/Subheader';

import { red900, green900, grey300 } from 'material-ui/styles/colors';

import { List, ListItem } from 'material-ui/List';
import { connect } from 'react-redux';
import moment from 'moment';

import AddVariationButton from './addVariationButton';
import FilterIcon from 'material-ui/svg-icons/content/filter-list';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import { Link } from 'react-router-dom';

import { removeVariation } from "../actions/variations";
import AppBar from "./appbar";
import VariationSummary from "./variationSummary";
import { filterVariations, groupVariationsByCategory, sortVariations, groupVariationsByTypeAndFrequency, computeGroupedVariations } from "../utils/variations";
import translations from "../translations";
import { setSelectedVariations } from "../actions/variations";
import { openVariationForm, closeVariationForm } from "../actions/variationForm";
import { spreadToText } from "../utils/dates";
import { computeAmount } from "../utils/variations";
import VariationForm from './variationForm';
import ResponsiveContainer from './responsiveContainer';

const targetDateText = (props) => {
  if (props.variation.direction === "project") {
    return (translations[props.locale].untilDate.replace("END_DATE", moment(props.variation.end).locale(props.locale).format("LL")));
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
          {`${new Intl.NumberFormat(props.locale, { style: 'currency', currency: props.currency }).format(props.variation.dailyAmount)} / ${translations[props.locale].shortRange[props.range]}`}
        </div>
        <div>
          {
            props.variation.direction === "project" &&
              translations[props.locale].untilDate.replace("END_DATE", moment(props.variation.end).locale(props.locale).format("LL"))
          }
        </div>
      </div>
    </span>
  );
}

const DeleteVariationButton = (props) => (
  <IconButton onClick={() => props.selectedVariations.forEach((uuid) => props.removeVariation(uuid))}>
    <DeleteIcon color="white" />
  </IconButton>
)

const FilterMenuButton = (props) => (
  <IconMenu
    style={{
      width: "100%"
    }}
    iconButtonElement={<IconButton><FilterIcon color="white" /></IconButton>}
  >
    {
      Object.entries({ "recurringOnly": { frequency: "one-time"}, "oneTimeOnly": { frequency: "one-time" } }).map(([name, filters]) => (
        <MenuItem primaryText={translations[props.locale].filters[name]} key={name} />
      ))
    }
  </IconMenu>
)

const SettingsButton = (props) => (
  <IconButton containerElement={<Link to="/settings" />}>
    <SettingsIcon color="white" />
  </IconButton>
)

const variationItems = (props, variations) => (
  sortVariations(variations).map((variation, index) => {
    const isSelected = props.selectedVariations.includes(variation.children[0]);

    return (
      <div key={index}>
        <ListItem
          style={isSelected ? { background: grey300 } : {} }
          onClick={() => isSelected ? props.setSelectedVariations([]) : props.setSelectedVariations(variation.children)}
          primaryText={<VariationItemAmount variation={variation} locale={props.locale} range={props.range} currency={props.currency} />}
          secondaryText={
            <p
              style={{
                fontSize: "0.7em",
                marginTop: 2,
                fontWeight: "bold"
              }}
            >
              {variation.label || translations[props.locale].noLabel}
            </p>
          }
          leftIcon={variation.direction === "spending" || variation.direction === "project" ? <ArrowDropDownIcon color={red900} /> : <ArrowDropUpIcon color={green900} />}
        />
        <Divider inset={variations.indexOf(variation) !== variations.length - 1} />
      </div>
    );
  })
);

const VariationList = (props) => {
  const filteredVariations = filterVariations(props.variations, props.currentDate, 'month');
  const groupedVariations = groupVariationsByTypeAndFrequency(filteredVariations);
  return (
    <div>
      <AppBar
        title={translations[props.locale].estimate}
        showMenuIconButton={false}
        iconElementRight={
          props.selectedVariations.length > 0 ? <DeleteVariationButton {...props} /> : <SettingsButton {...props} />
        }
      />

      <VariationSummary style={{ position: "fixed", width: "100%", zIndex: 1, paddingTop: 64 }} range={props.range} />
      <div
        style={{
          paddingTop: 120,
          paddingBottom: 48,
          zIndex: 0
        }}
      >
        <ResponsiveContainer
          paperStyle={{
            height: "calc(100vh - 184px)"
          }}
        >
          <List>
            {
              Object.entries(groupedVariations).map(([groupingName, variations]) => (
                <div
                  key={groupingName}
                >
                  {
                    variations.length > 0 &&
                      <Subheader
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: "bold"
                        }}
                      >
                        {translations[props.locale].groupingNames[groupingName]}
                      </Subheader>
                  }
                  {
                    props.groupByCategory ?
                      variationItems(props, computeGroupedVariations(Object.entries(groupVariationsByCategory(variations)), props.range, props.currentDate)) :
                      variationItems(props, computeGroupedVariations(variations.map((variation) => [variation.uuid, [variation]]), props.range, props.currentDate))
                  }
                </div>
              ))
            }
          </List>
        </ResponsiveContainer>
        <AddVariationButton containerElement={<Link to="/new" />} />
      </div>
      { props.formOpen && <VariationForm onRequestClose={props.closeVariationForm} /> }
    </div>
  );
}

function mapStateToProps(state, props) {
  return ({
    variations: state.variations,
    selectedVariations: state.selectedVariations,
    range: props.match.params.range || "day",
    locale: state.configuration.locale,
    currency: state.configuration.currency,
    groupByCategory: state.configuration.groupByCategory,
    currentMonthOnly: state.configuration.currentMonthOnly,
    currentDate: state.currentDate,
    formOpen: state.variationForm,
    currentFilter: state.currentFilter
  });
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    removeVariation: (uuid) => dispatch(removeVariation(uuid)),
    setSelectedVariations: (uuid) => dispatch(setSelectedVariations(uuid)),
    openVariationForm: () => {
      dispatch(openVariationForm());
    },
    closeVariationForm: () => dispatch(closeVariationForm())
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VariationList);
