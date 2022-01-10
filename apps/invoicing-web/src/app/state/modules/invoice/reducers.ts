import { combineReducers } from "redux";
import { createReducer } from "typesafe-actions";

import { Invoice, InvoiceItem } from "./types";
import { createLoadingReducer } from "../../redux/helpers";
import {
  getInvoice,
  updatePayerAsync,
  getInvoiceVat,
  getInvoices,
  applyCouponAction,
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
  .handleAction(getInvoice.success, (state, action) => {
    return action.payload;
  })
  .handleAction(updatePayerAsync.success, (state, action) => ({
    ...state,
    payer: action.payload,
  }))
  .handleAction(applyCouponAction.success, (state, action) => {
    const { reduction } = action.payload;

    const newState = { ...state, invoiceItem: { ...state.invoiceItem } };

    if (!newState.invoiceItem.coupons) {
      newState.invoiceItem.coupons = [];
    }

    newState.invoiceItem.coupons = [
      ...newState.invoiceItem.coupons,
      action.payload,
    ];

    return newState;
  })
  .handleAction(getInvoiceVat.success, (state, action) => {
    const invoiceItem = state.invoiceItem || ({} as InvoiceItem);
    const { payload } = action;
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

const invoiceCouponInitialState = { error: null };
const invoiceCoupon = createReducer(invoiceCouponInitialState)
  .handleAction(getInvoice.success, () => invoiceCouponInitialState)
  .handleAction(applyCouponAction.success, () => invoiceCouponInitialState)
  .handleAction(applyCouponAction.failure, (state, action) => {
    return { ...state, error: action.payload };
  });
const payerLoading = createLoadingReducer(updatePayerAsync);
const invoiceLoading = createLoadingReducer(getInvoice, true);
const invoicesLoading = createLoadingReducer(getInvoices, true);

export default combineReducers({
  invoice,
  invoiceCoupon,
  payerLoading,
  invoiceLoading,
  invoicesLoading,
});
