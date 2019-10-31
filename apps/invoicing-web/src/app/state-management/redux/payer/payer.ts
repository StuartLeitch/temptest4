import CONSTANTS from "./constants";
import { PaymentDoneActionType, UpdatePayerActionType } from "./actions";
import { initialState, StateSlice } from "./state";

// * State handlers
const updateHandler = (state: StateSlice, action: UpdatePayerActionType): StateSlice => ({
  ...state,
  ...action.payer,
}) as StateSlice;

const paymentDone = (state: StateSlice, action: PaymentDoneActionType): StateSlice => ({
  ...state,
  ...action.payment,
});

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
