import CONSTANTS from "./constants";
import { Payer } from "@hindawi/shared";

export interface ActionType {
  type: string;
}

export interface UpdatePayerActionType extends ActionType {
  payer: Payer | null;
}

export interface PaymentDoneActionType extends ActionType {
  payment: any | null;
}

// Action creators
export const updatePayerAction = payer => ({
  type: CONSTANTS.UPDATE,
  payer,
});

export const createPaymentAction = () => ({
  type: CONSTANTS.CREATE_PAYMENT,
});

export const createPaymentFulfilled = payment => ({
  type: CONSTANTS.CREATE_PAYMENT_FULFILLED,
  payment,
});
