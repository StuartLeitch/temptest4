import { combineReducers } from "redux";
import { createReducer } from "typesafe-actions";

import { Invoice } from "./types";
import { createLoadingReducer } from "../../redux/helpers";
import { getInvoice, updatePayerAsync, recordCardPayment } from "./actions";

const initialState: Invoice = {
  id: null,
  status: null,
  payer: null,
};

const invoice = createReducer(initialState)
  .handleAction(getInvoice.success, (_, action) => action.payload)
  .handleAction(updatePayerAsync.success, (state, action) => ({
    ...state,
    payer: action.payload,
  }));

const payerLoading = createLoadingReducer(updatePayerAsync);

const invoiceLoading = createLoadingReducer(getInvoice);

export default combineReducers({
  invoice,
  payerLoading,
  invoiceLoading,
});
