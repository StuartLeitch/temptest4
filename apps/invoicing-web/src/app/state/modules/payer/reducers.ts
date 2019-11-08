import { createReducer } from "typesafe-actions";

import { PayerState } from "./types";
import { updatePayerAsync } from "./actions";

const initialState: PayerState = {
  payer: {
    type: null,
    name: "",
    city: "",
    email: "",
    country: "",
    billingAddress: "",
  },
  error: null,
  loading: false,
};

export default createReducer(initialState)
  .handleAction(updatePayerAsync.request, state => ({
    ...state,
    loading: true,
  }))
  .handleAction(updatePayerAsync.failure, (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  }))
  .handleAction(updatePayerAsync.success, (state, action) => ({
    error: null,
    loading: false,
    payer: action.payload,
  }));
