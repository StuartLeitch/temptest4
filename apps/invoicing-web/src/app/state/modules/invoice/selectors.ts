import { createSelector } from "reselect";
import { RootState } from "typesafe-actions";

import { InvoiceState } from "./types";

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

const _getInvoice = (state: RootState): InvoiceState =>
  state.invoice as InvoiceState;

export const invoiceSlice = createSelector(
  _getInvoice,
  invoiceSlice => invoiceSlice,
);

export const invoice = createSelector(
  _getInvoice,
  invoiceSlice => invoiceSlice.invoice,
);

export const invoiceCharge = createSelector(_getInvoice, invoiceSlice => {
  const { price, vat } = invoiceSlice.invoice.invoiceItem;
  const amount = round(price * ((100 + vat) / 100), 2);
  return amount;
});

export const invoiceIsPaid = createSelector(
  _getInvoice,
  invoiceSlice => invoiceSlice.invoice.status === "FINAL",
);

export const invoiceError = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.invoiceLoading.error,
);

export const invoiceLoading = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.invoiceLoading.loading,
);

export const payerError = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.payerLoading.error,
);

export const payerLoading = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.payerLoading.loading,
);
