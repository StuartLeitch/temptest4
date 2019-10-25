import { createSelector } from "reselect";
import { Payer } from "@hindawi/shared";

export interface StateType {
  readonly payer: Payer | null;
}

export const initialState: StateType = {
  payer: null,
};

export type StateSlice = StateType["payer"];

// selectors
const getPayer = (state: any): StateSlice => state.payer;

export const selectPayer = createSelector(
  getPayer,
  (payer: any) => {
    if (!payer) {
      return null;
    } else {
      return {
        payerInfo: {
          name: payer.name,
          email: payer.email,
          country: payer.country,
        },
        billingAddress: payer.billingAddress,
        cardDetails: payer.cardDetails,
      };
    }
  },
);
