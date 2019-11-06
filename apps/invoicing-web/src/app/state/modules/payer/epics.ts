import { RootEpic, isActionOf } from "typesafe-actions";
import { ignoreElements, tap, filter } from "rxjs/operators";
import { ofType, ActionsObservable } from "redux-observable";

import CONSTANTS from "./constants";
import { createPayerAsync } from "./actions";

const createPayerAsyncEpic: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(isActionOf(createPayerAsync.request)),
    tap((action) => console.log("se ruleaza epicul -> createPayerAsyncEpic")),
    ignoreElements(),
  );
};

const createPaymentEpic = (action$: ActionsObservable<any>) =>
  action$.pipe(
    ofType(CONSTANTS.CREATE_PAYMENT),
    tap(() => console.log("create payment", action$)),
    ignoreElements(),
  );

const paymentDoneEpic = (action$: ActionsObservable<any>) =>
  action$.pipe(
    ofType(CONSTANTS.CREATE_PAYMENT_FULFILLED),
    tap(() => console.log("paymentDoneEpic")),
    ignoreElements(),
  );

const createPaypalPaymentEpic = (action$: ActionsObservable<any>) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYPAL_PAYMENT),
    tap(() => console.log("createPaypalPaymentEpic")),
    ignoreElements(),
  );
};

const paypalPaymentFulfilledEpic = (action$: ActionsObservable<any>) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYPAL_PAYMENT_FULFILLED),
    tap(() => console.log("paypalPaymentFulfilledEpic")),
    ignoreElements(),
  );
};

const createPayerEpic = (action$: ActionsObservable<any>) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYER),
    tap(() => console.log("createPayerEpic")),
    ignoreElements(),
  );
};

const updateAddressEpic = (action$: ActionsObservable<any>) => {
  return action$.pipe(
    ofType(CONSTANTS.UPDATE_ADDRESS),
    tap(() => console.log("updateAddressEpic")),
    ignoreElements(),
  );
};

export default [
  createPayerAsyncEpic,
  createPaymentEpic,
  paymentDoneEpic,
  createPaypalPaymentEpic,
  createPayerEpic,
  paypalPaymentFulfilledEpic,
  updateAddressEpic,
];
