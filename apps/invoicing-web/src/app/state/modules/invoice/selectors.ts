import { createSelector } from "reselect";
import { RootState } from "typesafe-actions";

import { InvoiceState } from "./types";

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

export const paymentError = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.paymentLoading.error,
);

export const paymentLoading = createSelector(
  _getInvoice,
  (invoiceSlice: InvoiceState) => invoiceSlice.paymentLoading.loading,
);
