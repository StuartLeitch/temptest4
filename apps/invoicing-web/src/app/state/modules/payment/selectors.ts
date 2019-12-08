import { createSelector } from "reselect";
import { RootState } from "typesafe-actions";

const _getPayments = (state: RootState) => state.payments;

export const getPaymentMethods = createSelector(_getPayments, p =>
  p.payment.methods
    .filter(m => m.isActive)
    .reduce((acc, el) => ({ ...acc, [el.id]: el.name }), {}),
);

export const getToken = createSelector(_getPayments, p => p.payment.token);

export const paymentMethodsLoading = createSelector(
  _getPayments,
  p => p.getMethodsLoading.loading,
);

export const paymentMethodsError = createSelector(
  _getPayments,
  p => p.getMethodsLoading.error,
);

export const recordCreditCardPaymentLoading = createSelector(
  _getPayments,
  p => p.recordCreditCardPaymentLoading.loading,
);

export const recordCreditCardPaymentError = createSelector(
  _getPayments,
  p => p.recordCreditCardPaymentLoading.error,
);

export const recordPayPalPaymentLoading = createSelector(
  _getPayments,
  p => p.recordPayPalPaymentLoading.loading,
);

export const recordPayPalPaymentError = createSelector(
  _getPayments,
  p => p.recordPayPalPaymentLoading.error,
);
