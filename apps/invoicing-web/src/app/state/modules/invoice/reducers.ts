import { combineReducers } from "redux";
import { createReducer } from "typesafe-actions";

import { Invoice } from "./types";
import { createLoadingReducer } from "../../redux/helpers";
import { getInvoice, updatePayerAsync } from "./actions";

const initialState: Invoice = {
  id: null,
  status: null,
  payer: null,
  invoiceItems: [],
};

const invoice = createReducer(initialState)
  .handleAction(getInvoice.success, (_, action) => action.payload)
  .handleAction(updatePayerAsync.success, (state, action) => ({
    ...state,
    payer: action.payload,
  }));

const payerLoading = createLoadingReducer(updatePayerAsync);

const invoiceLoading = createLoadingReducer(getInvoice, true);

export default combineReducers({
  invoice,
  payerLoading,
  invoiceLoading,
});
