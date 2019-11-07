import { createSelector } from "reselect";
import { RootState } from "typesafe-actions";

import { InvoiceState } from "./types";

const _getInvoice = (state: RootState): InvoiceState => state.invoice;

export const invoiceSlice = createSelector(
  _getInvoice,
  invoiceSlice => invoiceSlice,
);

export const invoiceLoading = createSelector(
  _getInvoice,
  invoiceSlice => invoiceSlice.loading,
);

export const invoiceError = createSelector(
  _getInvoice,
  invoiceSlice => invoiceSlice.error,
);

export const invoice = createSelector(
  _getInvoice,
  invoiceSlice => invoiceSlice.invoice,
);
