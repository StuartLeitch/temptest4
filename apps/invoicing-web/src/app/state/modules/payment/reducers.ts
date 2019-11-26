import { createReducer } from "typesafe-actions";
import { combineReducers } from "redux";

import { PaymentsSlice } from "./types";
import { createLoadingReducer } from "../../redux/helpers";
import {
  getPaymentMethods,
  recordCardPayment,
  recordPayPalPayment,
} from "./actions";

const initialState: PaymentsSlice = {
  methods: [],
};

const payment = createReducer(initialState).handleAction(
  getPaymentMethods.success,
  (state, action) => ({
    ...state,
    methods: action.payload,
  }),
);

const getMethodsLoading = createLoadingReducer(getPaymentMethods);

const recordCreditCardPaymentLoading = createLoadingReducer(recordCardPayment);

const recordPayPalPaymentLoading = createLoadingReducer(recordPayPalPayment);

export default combineReducers({
  recordCreditCardPaymentLoading,
  recordPayPalPaymentLoading,
  getMethodsLoading,
  payment,
});
