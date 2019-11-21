import { createReducer } from "typesafe-actions";
import { combineReducers } from "redux";

import { PaymentsSlice } from "./types";
import { createLoadingReducer } from "../../redux/helpers";
import { getPaymentMethods, recordCardPayment } from "./actions";

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

const recordPaymentLoading = createLoadingReducer(recordCardPayment);

export default combineReducers({
  recordPaymentLoading,
  getMethodsLoading,
  payment,
});
