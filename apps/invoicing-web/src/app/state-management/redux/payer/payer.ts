import { createSelector } from "reselect";
import { Payer } from "@hindawi/shared";

import CONSTANTS from "./constants";
import { initialState, StateType } from "./state";

type StateSlice = StateType["payer"];

export interface ActionType {
  type: string;
}

export interface UpdatePayerActionType {
  type: string;
  payer: Payer | null;
}

const getPayer = (state: StateType): StateSlice => state.payer;

export const selectPayer = createSelector(
  getPayer,
  (payer: any) => {
    if (!payer) {
      return null;
    } else {
      return {
        // name: manuscript.authorSurname,
        // email: manuscript.authorEmail,
        // country: manuscript.authorCountry,
      };
    }
  },
);

// * Action Creators
export const updatePayerAction = payer => ({
  type: CONSTANTS.UPDATE,
  payer,
});

const updateHandler = (state: StateSlice, action: UpdatePayerActionType): StateType["payer"] => {
  return action.payer;
};

export const payer = (
  state: StateSlice = initialState.payer,
  action: UpdatePayerActionType,
): StateSlice => {
  switch (action.type) {
    case CONSTANTS.UPDATE:
      return updateHandler(state, action);
    default:
      return state;
  }
};
