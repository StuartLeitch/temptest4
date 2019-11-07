import { createSelector } from "reselect";
import { RootState } from "typesafe-actions";

import { PayerState } from "./types";

const _getPayer = (state: RootState): PayerState => state.payer;

export const payerSlice = createSelector(
  _getPayer,
  payerSlice => payerSlice,
);

export const payerLoading = createSelector(
  _getPayer,
  payerSlice => payerSlice.loading,
);

export const payerError = createSelector(
  _getPayer,
  payerSlice => payerSlice.error,
);

export const payer = createSelector(
  _getPayer,
  payerSlice => payerSlice.payer,
);
