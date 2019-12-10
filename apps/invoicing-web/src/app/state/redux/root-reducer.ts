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
  totalCount: 0,
  isLoading: false,
  error: null,
};

const invoices = createReducer(initialInvoicesState).handleAction(
  getInvoices.success,
  (_, action) => {
    const totalCount = action.payload.totalCount;
    const ids = action.payload.invoices.map(i => i.id);
    const byId = action.payload.invoices.reduce((acc, i) => {
      acc[i.id] = i;
      return acc;
    }, {});
    return {
      ...initialInvoicesState,
      totalCount,
      ids,
      byId,
    };
  },
);

const _getInvoices = (state: any) => state.invoices;
export const invoicesMap = createSelector(_getInvoices, invoices =>
  Object.values(invoices.byId),
);
export const invoicesTotalCount = createSelector(
  _getInvoices,
  invoices => invoices.totalCount,
);

export const invoicesLoading = createSelector(
  _getInvoices,
  invoices => invoices.isLoading,
);

const rootReducer = combineReducers({
  modal: modalReducer,
  payments,
  invoice: invoiceReducer,
  invoices,
});

export default rootReducer;
