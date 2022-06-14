import { createReducer } from "typesafe-actions";
import { combineReducers } from "redux";

import { PaymentsSlice } from "./types";
import { createLoadingReducer } from "../../redux/helpers";
import {
  getPaymentMethods,
  getClientToken,
  recordCardPayment,
  recordPayPalPayment,
} from "./actions";

const initialState: PaymentsSlice = {
  methods: [],
  token: "",
};

const payment = createReducer(initialState)
  .handleAction(getPaymentMethods.success, (state, action) => ({
    ...state,
    methods: action.payload,
  }))
  .handleAction(getClientToken.success, (state, action) => {
    window.sessionStorage.setItem("braintreeTokenLoaded", "true");
    return {
      ...state,
      token: action.payload.token,
    };
  });

const getMethodsLoading = createLoadingReducer(getPaymentMethods);

const recordCreditCardPaymentLoading = createLoadingReducer(recordCardPayment);

const recordPayPalPaymentLoading = createLoadingReducer(recordPayPalPayment);

export default combineReducers({
  recordCreditCardPaymentLoading,
  recordPayPalPaymentLoading,
  getMethodsLoading,
  // token,
  payment,
});
