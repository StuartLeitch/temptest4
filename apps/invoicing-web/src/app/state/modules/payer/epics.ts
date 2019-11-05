import { ignoreElements, tap } from "rxjs/operators";
import { ofType, ActionsObservable } from "redux-observable";

import CONSTANTS from "./constants";

const createPaymentEpic = (action$: ActionsObservable<any>) => {
  return action$.pipe(
    ofType(CONSTANTS.CREATE_PAYMENT),
    tap(() => console.log("create payment")),
    ignoreElements(),
  );
};

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
  createPaymentEpic,
  paymentDoneEpic,
  createPaypalPaymentEpic,
  createPayerEpic,
  paypalPaymentFulfilledEpic,
  updateAddressEpic,
];
