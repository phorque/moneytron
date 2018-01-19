import React from 'react';
import IconButton from 'material-ui/IconButton';
import DoneIcon from 'material-ui/svg-icons/action/done';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';

import currencyToSymbolMap from 'currency-symbol-map/map';

import AppBar from "./appbar";

import { connect, dispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { updateConfiguration } from '../actions/configuration';
import { defaultMonthsSelection, numberOfMonthsToText } from "../utils/dates";
import ResponsiveSelect from "./responsiveSelect";
import translations from "../translations";

const required = value => (value ? undefined : 'This field is required.')

const SettingsForm = (props) => (
  <div>
    <AppBar
    title={translations[props.locale].settings}
      onLeftIconButtonClick={props.history.goBack}
      iconElementLeft={<IconButton><BackIcon /></IconButton>}
      iconElementRight={<IconButton onClick={props.handleSubmit}><DoneIcon /></IconButton>}
    />
    <div style={{ padding: "0 1em", paddingTop: 64 }}>
      <ResponsiveSelect
        name="currency"
        validate={[required]}
        label={translations[props.locale].currency}
        collection={
          Object.keys(currencyToSymbolMap).reduce((collection, currency) => (
            { ...collection, [currency]: currency }
          ), {})
        }
      />
      <ResponsiveSelect
        name="locale"
        validate={[required]}
        label={translations[props.locale].language}
        collection={
          Object.keys(translations).reduce((collection, locale) => (
            { ...collection, [locale]: translations[locale].name }
          ), {})}
      />
    </div>
  </div>
)

const mapStateToProps = (state) => {
  return {
    initialValues: state.configuration,
    locale: state.configuration.locale
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    onSubmit: (values) => {
      props.history.goBack();
      dispatch(updateConfiguration(values));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({ form: "settings" })(SettingsForm));
