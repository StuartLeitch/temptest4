import { createSelector } from "reselect";

import { Invoice } from "@hindawi/shared";

import CONSTANTS from "./constants";
import { initialState, StateType } from "./state";

type StateSlice = StateType["invoice"];

export interface ActionType {
  type: string;
}

export interface FetchInvoiceActionType {
  type: string;
  invoice: Invoice | null;
}

const getInvoice = (state: StateType): StateSlice => state.invoice;
export const selectInvoice = createSelector(
  getInvoice,
  invoice => invoice,
);

const fetchHandler = (state: StateSlice, action: FetchInvoiceActionType): StateType["invoice"] => {
  return action.invoice;
};

export const invoice = (
  state: StateSlice = initialState.invoice,
  action: FetchInvoiceActionType,
): StateSlice => {
  switch (action.type) {
    case CONSTANTS.FETCH_FULFILLED:
      return fetchHandler(state, action);
    default:
      return state;
  }
};
