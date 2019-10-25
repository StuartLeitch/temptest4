import { createSelector } from "reselect";

import CONSTANTS from "./constants";
import { UpdatePayerActionType } from "./actions";
import { initialState, StateType, StateSlice } from "./state";

// * State handlers
const updateHandler = (state: StateSlice, action: UpdatePayerActionType): StateType["payer"] => {
  return {
    ...state,
    ...action.payer,
  } as StateType["payer"];
};

export const payer = (
  state: StateSlice = initialState.payer,
  action: UpdatePayerActionType,
): StateSlice => {
  switch (action.type) {
    case CONSTANTS.UPDATE:
      return updateHandler(state, action);
    case CONSTANTS.CREATE_PAYMENT:
      return state;
    default:
      return state;
  }
};
