import Message from "antd/lib/message";
import { ofType, ActionsObservable, StateObservable } from "redux-observable";
import { mergeMap, map, ignoreElements, tap, switchMap, withLatestFrom } from "rxjs/operators";
import { Axios } from "axios-observable";
import gql from "graphql-tag";
import { print } from "graphql";

import CONSTANTS from "./constants";
import { selectPayer, StateSlice } from "./state";
import { createPaymentFulfilled, createPayerFulfilled } from "./actions";
import { of } from "rxjs";

// * epic
export const createPaymentEpic = (
  action$: ActionsObservable<any>,
  state$: StateObservable<any>,
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

// * paypal epics
export const createPaypalPaymentEpic = (
  action$: ActionsObservable<any>,
  state$: StateObservable<any>,
) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYPAL_PAYMENT),
    withLatestFrom(state$),
    switchMap(([{ payment }, state]) => {
      const payer = selectPayer(state);
      return Axios.post(
        "http://localhost:3000/api/paypal-payment-created",
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
  );
};

export const paypalPaymentFulfilledEpic = (action$: ActionsObservable<any>) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYPAL_PAYMENT_FULFILLED),
    tap(({ payment }) => {
      Message.success(
        `Payment successfully processed! Paypal payment id ==> ${payment.paymentID}`,
        7,
      );
    }),
    ignoreElements(),
  );
};

// * create payer

const createPayer = gql`
  mutation createPayer($input: PayerInput!) {
    createPayer(input: $input) {
      id
      name
      email
    }
  }
`;

export const createPayerEpic = (action$: ActionsObservable<any>) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYER),
    tap(({ payerInfo }) => {
      Message.success(`Creating payer -> ${payerInfo.email}`, 3);
    }),
    // mergeMap(({ payerInfo }) =>
    //   Axios.post("http://localhost:4000/graphql", {
    //     query: print(createPayer),
    //     variables: { input: payerInfo },
    //   }),
    // ),
    // map(({ data }) => {
    //   return createPayerFulfilled(data.data.createPayer);
    // }),
    ignoreElements(),
  );
};

export const updateAddressEpic = (action$: ActionsObservable<any>) => {
  return action$.pipe(
    ofType(CONSTANTS.UPDATE_ADDRESS),
    tap(({ billingAddress }) => {
      Message.success(`Creating address -> ${billingAddress.address}`, 3);
    }),
    ignoreElements(),
  );
};
