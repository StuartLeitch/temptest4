import { createReducer } from "typesafe-actions";

import { InvoiceState } from "./types";
import { getInvoice } from "./actions";

const initialState: InvoiceState = {
  invoice: null,
  error: null,
  loading: false,
};

export default createReducer(initialState)
  .handleAction(getInvoice.request, state => ({
    ...state,
    loading: true,
  }))
  .handleAction(getInvoice.success, (state, action) => ({
    ...state,
    loading: false,
    invoice: action.payload,
  }))
  .handleAction(getInvoice.failure, (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  }));
