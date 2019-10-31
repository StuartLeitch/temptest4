import { ofType, ActionsObservable, StateObservable } from "redux-observable";
import { mergeMap, map, ignoreElements, tap, switchMap, withLatestFrom } from "rxjs/operators";
const Axios = require("axios-observable").Axios;

import CONSTANTS from "./constants";
import { selectPayer, StateSlice } from "./state";
import { createPaymentFulfilled } from "./actions";

import Message from "antd/es/message";
import { of } from "rxjs";

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
        `http://${(window as any)._env_.API_URL}/api/checkout`,
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
      Message.success(`Payment successfully processed! Braintree payment id ==> ${payment.id}`, 7);
    }),
    ignoreElements(),
  );

export const createPaypalPaymentEpic = (
  action$: ActionsObservable<any>,
  state$: StateObservable<StateSlice>,
) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYPAL_PAYMENT),
    withLatestFrom(state$),
    switchMap(([{ payment }, state]) => {
      const payer = selectPayer(state);
      return Axios.post(
        "http://localhost:80/api/paypal-payment-created",
        {
          payer,
          payment,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );
    }),
    ignoreElements(),
  );
};
