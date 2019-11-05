import CONSTANTS from "./constants";

export const createPaymentAction = () => ({
  type: CONSTANTS.CREATE_PAYMENT,
});

export const createPaymentFulfilled = payment => ({
  type: CONSTANTS.CREATE_PAYMENT_FULFILLED,
  payment,
});

export const createPayer = (payerInfo: any) => ({
  type: CONSTANTS.CREATE_PAYER,
  payerInfo,
});

export const createPayerFulfilled = payerInfo => ({
  type: CONSTANTS.CREATE_PAYER_FULFILLED,
  payerInfo,
});

export const updatePayerAction = (payerInfo: any) => ({
  type: CONSTANTS.UPDATE_PAYER,
  payerInfo,
});

export const updateBillingAddress = (billingAddress: any) => ({
  type: CONSTANTS.UPDATE_ADDRESS,
  billingAddress,
});

export const updateCreditCard = (creditCard: any) => ({
  type: CONSTANTS.UPDATE_CARD,
  creditCard,
});

export const createPaypalPayment = payment => ({
  type: CONSTANTS.CREATE_PAYPAL_PAYMENT,
  payment,
});

export const paypalPaymentFulfilled = (payment: any) => ({
  type: CONSTANTS.CREATE_PAYPAL_PAYMENT_FULFILLED,
  payment,
});
