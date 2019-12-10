import { combineReducers } from "redux";
import { createReducer } from "typesafe-actions";

import { Invoice, InvoiceItem } from "./types";
import { createLoadingReducer } from "../../redux/helpers";
import {
  getInvoice,
  updatePayerAsync,
  getInvoiceVat,
  getInvoices,
} from "./actions";

const initialState: Invoice = {
  id: null,
  invoiceId: null,
  payer: null,
  status: null,
  referenceNumber: null,
  invoiceItem: null,
  article: null,
};

const invoice = createReducer(initialState)
  .handleAction(getInvoice.success, (_, action) => action.payload)
  .handleAction(updatePayerAsync.success, (state, action) => ({
    ...state,
    payer: action.payload,
  }))
  .handleAction(getInvoiceVat.success, (state, action) => {
    let invoiceItem = state.invoiceItem || ({} as InvoiceItem);
    let { payload } = action;
    return {
      ...state,
      invoiceItem: {
        ...invoiceItem,
        rate: payload.rate,
        vat: payload.vatPercentage,
        vatnote: payload.vatNote,
      },
    };
  });

const payerLoading = createLoadingReducer(updatePayerAsync);
const invoiceLoading = createLoadingReducer(getInvoice, true);
const invoicesLoading = createLoadingReducer(getInvoices, true);

export default combineReducers({
  invoice,
  payerLoading,
  invoiceLoading,
  invoicesLoading,
});
