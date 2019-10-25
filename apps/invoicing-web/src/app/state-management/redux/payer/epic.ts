import { ofType, ActionsObservable, StateObservable } from "redux-observable";
import { mergeMap, map, ignoreElements, tap } from "rxjs/operators";
const Axios = require("axios-observable").Axios;

import CONSTANTS from "./constants";
import { selectPayer, StateSlice } from "./state";
import { createPaymentFulfilled } from "./actions";

import Message from "antd/es/message";

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
    mergeMap(action =>
      Axios.post(
        "http://localhost:3000/api/checkout",
        // JSON.stringify({
        //   ...state$.value.payer.cardDetails,
        // }),
        {
          amount: 1900,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      ).pipe(
        map((response: any) => {
          // Message.success(response.data);
          return createPaymentFulfilled(response.data);
        }),
      ),
    ),
  );
};

export const paymentDoneEpic = action$ =>
  action$.pipe(
    ofType(CONSTANTS.CREATE_PAYMENT_FULFILLED),
    tap(({ payment }) => {
      Message.success(`Payment succesfully processed! Braintree payment id ==> ${payment.id}`, 7);
    }),
    ignoreElements(),
  );
