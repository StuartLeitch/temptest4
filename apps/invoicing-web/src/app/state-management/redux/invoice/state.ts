import { Invoice } from "../../../../../../../libs/shared/src/lib/modules/invoices/domain/Invoice";

export interface StateType {
  readonly invoice: Invoice | null;
}

export const initialState: StateType = {
  invoice: null,
};
