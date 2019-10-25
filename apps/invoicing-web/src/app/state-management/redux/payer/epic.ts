import { ofType, ActionsObservable, StateObservable } from "redux-observable";
import { mergeMap, map } from "rxjs/operators";
const Axios = require("axios-observable").Axios;

import CONSTANTS from "./constants";
import { selectPayer, StateSlice } from "./state";
import { createPaymentFulfilled } from "./actions";

// * Action Creators
interface InvoiceFetchActionType {
  type: string;
  invoiceId?: string;
}

export const fetchInvoiceAction = (invoiceId: string): InvoiceFetchActionType => ({
  type: CONSTANTS.CREATE_PAYMENT,
  invoiceId,
});

// * epic
export const createPaymentEpic = (
  action$: ActionsObservable<any>,
  state$: StateObservable<StateSlice>,
) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYMENT),
    map(() => selectPayer(state$.value)),
    mergeMap(paymentInfo =>
      Axios.post(
        "http://localhost:4200/graphql",
        JSON.stringify({
          query: `query Invoice { Invoice(id: "invoice-1") { id, transactionId, status } }`,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      ).pipe(
        map((response: any) => {
          return createPaymentFulfilled(paymentInfo);
        }),
      ),
    ),
  );
};
