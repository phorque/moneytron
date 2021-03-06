import configuration from "./reducers/configuration";
import variations from "./reducers/variations";
import selectedVariations from "./reducers/selectedVariations";
import variationForm from "./reducers/variationForm";
import currentDate from "./reducers/currentDate";
import summaryDisplay from "./reducers/summaryDisplay";

import { routerReducer } from 'react-router-redux';

import { combineReducers } from "redux";
import { reducer as formReducer, actionTypes as formActionTypes } from 'redux-form';

export default combineReducers({
  configuration,
  variationForm,
  variations,
  currentDate,
  selectedVariations,
  summaryDisplay,
  form: formReducer,
  router: routerReducer
})
