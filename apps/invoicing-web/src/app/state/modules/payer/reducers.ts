import { createReducer } from "typesafe-actions";

import { PayerState } from "./types";
import { createPayerAsync } from "./actions";

const initialState: PayerState = {
  payer: {
    paymentType: null,
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    email: "",
  },
  error: null,
  loading: false,
};

export default createReducer(initialState).handleAction(
  createPayerAsync.request,
  state => ({ ...state, loading: true }),
);
