import { createSelector } from "reselect";
import { RootState } from "typesafe-actions";

const _getPayments = (state: RootState) => state.payments;

export const getPaymentMethods = createSelector(
  _getPayments,
  p => p.payments.methods,
);

export const paymentMethodsLoading = createSelector(
  _getPayments,
  p => p.getMethodsLoading.loading,
);

export const paymentMethodsError = createSelector(
  _getPayments,
  p => p.getMethodsLoading.error,
);

export const recordPaymentLoading = createSelector(
  _getPayments,
  p => p.recordPaymentLoading.loading,
);

export const recordPaymentError = createSelector(
  _getPayments,
  p => p.recordPaymentLoading.error,
);
