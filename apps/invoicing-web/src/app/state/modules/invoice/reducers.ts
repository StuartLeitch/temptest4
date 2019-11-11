import { combineReducers, Reducer } from "redux";
import { createReducer } from "typesafe-actions";

import { LoadingState, Invoice, InvoiceState } from "./types";
import { getInvoice, updatePayerAsync } from "./actions";

const initialState: Invoice = {
  id: null,
  payer: null,
};

const initialLoading: LoadingState = {
  loading: false,
  error: null,
};

const invoice = createReducer(initialState)
  .handleAction(getInvoice.success, (_, action) => action.payload)
  .handleAction(updatePayerAsync.success, (state, action) => ({
    ...state,
    payer: action.payload,
  }));

const payerLoading = createReducer(initialLoading)
  .handleAction(
    updatePayerAsync.request,
    (): LoadingState => ({ loading: true, error: null }),
  )
  .handleAction(
    updatePayerAsync.success,
    (): LoadingState => ({
      loading: false,
      error: null,
    }),
  )
  .handleAction(
    updatePayerAsync.failure,
    (_, action): LoadingState => ({
      loading: false,
      error: action.payload,
    }),
  );

const invoiceLoading = createReducer(initialLoading)
  .handleAction(
    getInvoice.request,
    (): LoadingState => ({
      loading: true,
      error: null,
    }),
  )
  .handleAction(
    getInvoice.success,
    (): LoadingState => ({
      loading: false,
      error: null,
    }),
  )
  .handleAction(
    getInvoice.failure,
    (_, action): LoadingState => ({
      loading: false,
      error: action.payload,
    }),
  );

export default combineReducers({
  invoice,
  payerLoading,
  invoiceLoading,
});
