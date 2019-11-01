import { createSelector } from "reselect";

export interface StateType {
  readonly payer: {
    payerId: any;
    payerInfo: any;
    billingAddress: any;
    creditCard: any;
  };
}

export const initialState: StateType = {
  payer: {
    payerId: null,
    payerInfo: {},
    billingAddress: {},
    creditCard: {},
  },
};

export type StateSlice = StateType["payer"];

// selectors
const getPayer = (state: StateType): StateSlice => state.payer;

export const selectPayer = createSelector(
  getPayer,
  (payer: StateSlice) => {
    return {
      id: payer.payerId,
      payerInfo: payer.payerInfo,
      billingAddress: payer.billingAddress,
      cardDetails: payer.creditCard,
    };
  },
);
