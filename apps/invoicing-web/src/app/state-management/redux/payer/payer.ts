import { createSelector } from "reselect";

import CONSTANTS from "./constants";
import { PaymentDoneActionType, UpdatePayerActionType } from "./actions";
import { initialState, StateType, StateSlice } from "./state";

// * State handlers
const updateHandler = (state: StateSlice, action: UpdatePayerActionType): StateType["payer"] => {
  return {
    ...state,
    ...action.payer,
  } as StateType["payer"];
};

const paymentDone = (state: StateSlice, action: PaymentDoneActionType): StateType["payer"] => {
  return {
    ...state,
    ...action.payment,
  } as StateType["payer"];
};

export const payer = (state: StateSlice = initialState.payer, action: any): StateSlice => {
  switch (action.type) {
    case CONSTANTS.UPDATE:
      return updateHandler(state, action);
    case CONSTANTS.CREATE_PAYMENT:
      return state;
    case CONSTANTS.CREATE_PAYMENT_FULFILLED:
      return paymentDone(state, action);
    default:
      return state;
  }
};
