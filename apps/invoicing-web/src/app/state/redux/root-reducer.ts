import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { createReducer } from "typesafe-actions";

import invoiceReducer from "../modules/invoice/reducers";
import { getInvoices } from "../modules/invoice/actions";
import invoice from "../modules/invoice";
import payments from "../modules/payment";

import { modalReducer } from "../../providers/modal";

const initialInvoicesState = {
  byId: {},
  ids: [],
  isLoading: false,
  error: null,
};

const invoices = createReducer(initialInvoicesState).handleAction(
  getInvoices.success,
  (_, action) => {
    const ids = action.payload.map(i => i.id);
    const byId = action.payload.reduce((acc, i) => {
      acc[i.id] = i;
      return acc;
    }, {});
    return {
      ...initialInvoicesState,
      ids,
      byId,
    };
  },
);

const _getInvoices = state => state.invoices;
export const invoicesMap = createSelector(_getInvoices, invoices =>
  Object.values(invoices.byId),
);

const rootReducer = combineReducers({
  modal: modalReducer,
  payments,
  invoice: invoiceReducer,
  invoices,
});

export default rootReducer;
