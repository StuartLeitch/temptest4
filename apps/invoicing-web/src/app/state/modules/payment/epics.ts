import {
  withLatestFrom,
  catchError,
  switchMap,
  mergeMap,
  filter,
  map,
} from "rxjs/operators";
import { isActionOf, RootEpic } from "typesafe-actions";
import { ajax } from "rxjs/ajax";
import { of, from } from "rxjs";
import { config } from "../../../../config";

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
      const {
        paymentMethodId,
        invoiceId,
        payerId,
        ...creditCard
      } = action.payload;
      return graphqlAdapter.send(mutations.creditCardPayment, {
        invoiceId,
        payerId,
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

const recordPayPalPaymentEpic: RootEpic = (
  action$,
  state$,
  { graphqlAdapter },
) => {
  return action$.pipe(
    filter(isActionOf(recordPayPalPayment.request)),
    switchMap(action => {
      const {
        invoiceId,
        payerId,
        payPalOrderId,
        paymentMethodId,
      } = action.payload;
      return graphqlAdapter.send(mutations.recordPayPalPayment, {
        orderId: payPalOrderId,
        paymentMethodId,
        invoiceId,
        payerId,
      });
    }),
    withLatestFrom(state$.pipe(map(invoice))),
    mergeMap(([r, invoice]) => {
      return from([
        recordPayPalPayment.success(""),
        getInvoice.request(invoice.invoiceId),
      ]);
    }),
    catchError(err => of(recordPayPalPayment.failure(err.message))),
  );
};

export default [
  recordPayPalPaymentEpic,
  getPaymentsMethodsEpic,
  creditCardPaymentEpic,
];
