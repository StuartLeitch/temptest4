import CONSTANTS from "./constants";
import { StateSlice } from "./state";

export interface ActionType {
  type: string;
}

export interface PaymentDoneActionType extends ActionType {
  payment: any | null;
}

// * Action creators
export const createPaymentAction = () => ({
  type: CONSTANTS.CREATE_PAYMENT,
});

export const createPaymentFulfilled = payment => ({
  type: CONSTANTS.CREATE_PAYMENT_FULFILLED,
  payment,
});

// * Create or update payer action
export interface PayerInfoActionType extends ActionType {
  payerInfo: StateSlice["payerInfo"];
}

export const createPayer = (payerInfo: StateSlice["payerInfo"]) => ({
  type: CONSTANTS.CREATE_PAYER,
  payerInfo,
});

export const updatePayerAction = (payerInfo: StateSlice["payerInfo"]) => ({
  type: CONSTANTS.UPDATE_PAYER,
  payerInfo,
});

// * Update payer address
export interface UpdatePayerAddressActionType extends ActionType {
  billingAddress: StateSlice["billingAddress"];
}

export const updateBillingAddress = (billingAddress: StateSlice["billingAddress"]) => ({
  type: CONSTANTS.UPDATE_ADDRESS,
  billingAddress,
});

// * Update card details
export interface UpdateCardActionType extends ActionType {
  creditCard: StateSlice["creditCard"];
}

export const updateCreditCard = (creditCard: StateSlice["creditCard"]) => ({
  type: CONSTANTS.UPDATE_CARD,
  creditCard,
});

// * Paypal payments
export const createPaypalPayment = payment => ({
  type: CONSTANTS.CREATE_PAYPAL_PAYMENT,
  payment,
});

export const paypalPaymentFulfilled = (payment: any) => ({
  type: CONSTANTS.CREATE_PAYPAL_PAYMENT_FULFILLED,
  payment,
});
