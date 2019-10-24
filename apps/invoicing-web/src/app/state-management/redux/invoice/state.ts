import { Invoice } from "@hindawi/shared";

export interface StateType {
  readonly invoice: Invoice | null;
}

export const initialState: StateType = {
  invoice: null,
};
