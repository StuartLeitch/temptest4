import { Payer } from "@hindawi/shared";

export interface StateType {
  readonly payer: Payer | null;
}

export const initialState: StateType = {
  payer: null,
};
