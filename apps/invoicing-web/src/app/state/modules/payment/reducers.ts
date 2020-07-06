import { createReducer } from "typesafe-actions";
import { combineReducers } from "redux";

import { PaymentsSlice } from "./types";
import { createLoadingReducer } from "../../redux/helpers";
import {
  getPaymentMethods,
  getClientToken,
  recordCardPayment,
  recordPayPalPayment,
  createPayPalOrder,
} from "./actions";

const initialState: PaymentsSlice = {
  payPalOrderId: "",
  methods: [],
  token: "",
};

const payment = createReducer(initialState)
  .handleAction(getPaymentMethods.success, (state, action) => ({
    ...state,
    methods: action.payload,
  }))
  .handleAction(getClientToken.success, (state, action) => {
    return {
      ...state,
      token: action.payload.token,
    };
  })
  .handleAction(createPayPalOrder.success, (state, action) => {
    return {
      ...state,
      payPalOrderId: action.payload,
    };
  });

const getMethodsLoading = createLoadingReducer(getPaymentMethods);

const recordCreditCardPaymentLoading = createLoadingReducer(recordCardPayment);

const recordPayPalPaymentLoading = createLoadingReducer(recordPayPalPayment);
const createPayPalOrderLoading = createLoadingReducer(createPayPalOrder);

export default combineReducers({
  recordCreditCardPaymentLoading,
  recordPayPalPaymentLoading,
  createPayPalOrderLoading,
  getMethodsLoading,
  // token,
  payment,
});
