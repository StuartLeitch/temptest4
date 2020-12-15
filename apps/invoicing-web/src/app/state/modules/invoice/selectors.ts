import { createSelector } from "reselect";
import { RootState } from "typesafe-actions";

import { InvoiceState } from "./types";

function round(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

const _getInvoice = (state: RootState): InvoiceState =>
  state.invoice as InvoiceState;

export const invoiceSlice = createSelector(
  _getInvoice,
  (invoiceSlice) => invoiceSlice,
);

export const invoice = createSelector(
  _getInvoice,
  (invoiceSlice) => invoiceSlice.invoice,
);

export const coupons = createSelector(_getInvoice, (invoiceSlice) => {
  let coupons = invoiceSlice.invoice?.invoiceItem?.coupons || [];
  return [...coupons];
});

export const invoiceCharge = createSelector(_getInvoice, (invoiceSlice) => {
  const { price, vat } = invoiceSlice.invoice.invoiceItem;
  const amount = round(price * ((100 + vat) / 100), 2);
  return amount;
});

export const couponError = createSelector(
  (state: RootState) => {
    return state.invoice.invoiceCoupon;
  },
  (ic) => ic.error,
);

export const invoiceIsPaid = createSelector(
  _getInvoice,
  (invoiceSlice) => invoiceSlice.invoice.status === "FINAL",
);

export const invoiceError = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.invoiceLoading.error,
);

export const invoiceLoading = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.invoiceLoading.loading,
);

export const invoicesLoading = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.invoicesLoading.loading,
);

export const payerError = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.payerLoading.error,
);

export const payerLoading = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.payerLoading.loading,
);
