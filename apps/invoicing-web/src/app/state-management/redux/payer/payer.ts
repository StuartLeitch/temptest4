import { produce } from "immer";

import CONSTANTS from "./constants";
import {
  PayerInfoActionType,
  UpdateCardActionType,
  PaymentDoneActionType,
  UpdatePayerAddressActionType,
} from "./actions";
import { initialState, StateType, StateSlice } from "./state";

// * State handlers
const paymentDone = (state: StateSlice, action: PaymentDoneActionType): StateType["payer"] => {
  return {
    ...state,
    ...action.payment,
  } as StateType["payer"];
};

const createOrUpdatePayer = (state: StateSlice, action: PayerInfoActionType) =>
  produce(state, (draft: StateSlice) => {
    draft.payerInfo = action.payerInfo;
  });

const updateBillingAddress = (state: StateSlice, action: UpdatePayerAddressActionType) =>
  produce(state, (draft: StateSlice) => {
    draft.billingAddress = action.billingAddress;
  });

const updateCreditCard = (state: StateSlice, action: UpdateCardActionType) =>
  produce(state, (draft: StateSlice) => {
    draft.creditCard = action.creditCard;
  });

export const payer = (state: StateSlice = initialState.payer, action: any): StateSlice => {
  switch (action.type) {
    case CONSTANTS.CREATE_PAYER:
    case CONSTANTS.UPDATE_PAYER:
      return createOrUpdatePayer(state, action);
    case CONSTANTS.UPDATE_ADDRESS:
      return updateBillingAddress(state, action);
    case CONSTANTS.UPDATE_CARD:
      return updateCreditCard(state, action);
    case CONSTANTS.CREATE_PAYMENT:
      return state;
    case CONSTANTS.CREATE_PAYPAL_PAYMENT_FULFILLED:
      return state;
    case CONSTANTS.CREATE_PAYMENT_FULFILLED:
      return paymentDone(state, action);
    default:
      return state;
  }
};
