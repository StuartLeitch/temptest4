import {
  catchError,
  switchMap,
  filter,
  map,
  mergeMap,
  withLatestFrom,
} from "rxjs/operators";
import { isActionOf, RootEpic } from "typesafe-actions";
import { ajax } from "rxjs/ajax";
import { of, from } from "rxjs";

import { queries, mutations } from "./graphql";

import {
  recordPayPalPayment,
  getPaymentMethods,
  recordCardPayment,
} from "./actions";
import { getInvoice } from "./../invoice/actions";
import { invoice } from "./../invoice/selectors";

const getPaymentsMethodsEpic: RootEpic = (
  action$,
  state$,
  { graphqlAdapter },
) => {
  return action$.pipe(
    filter(isActionOf(getPaymentMethods.request)),
    switchMap(() => graphqlAdapter.send(queries.getPaymentMethods)),
    map(r => {
      return getPaymentMethods.success(r.data.getPaymentMethods);
    }),
  );
};

const creditCardPaymentEpic: RootEpic = (
  action$,
  state$,
  { graphqlAdapter },
) => {
  return action$.pipe(
    filter(isActionOf(recordCardPayment.request)),
    switchMap(action => {
      const { invoiceId, paymentMethodId, ...creditCard } = action.payload;
      return graphqlAdapter.send(mutations.creditCardPayment, {
        invoiceId,
        paymentMethodId,
        creditCard,
      });
    }),
    withLatestFrom(state$.pipe(map(invoice))),
    mergeMap(([r, invoice]) => {
      return from([
        recordCardPayment.success(r.data.creditCardPayment),
        getInvoice.request(invoice.invoiceId),
      ]);
    }),
    catchError(err => of(recordCardPayment.failure(err.message))),
  );
};

const recordPayPalPaymentEpic: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(isActionOf(recordPayPalPayment.request)),
    switchMap(action =>
      ajax.post(
        `./api/paypal-payment/${action.payload.payerId}/${action.payload.invoiceId}/${action.payload.payPalOrderId}`,
      ),
    ),
    map(r => {
      return recordPayPalPayment.success("");
    }),
    catchError(err => of(recordPayPalPayment.failure(err.message))),
  );
};

export default [
  recordPayPalPaymentEpic,
  getPaymentsMethodsEpic,
  creditCardPaymentEpic,
];
