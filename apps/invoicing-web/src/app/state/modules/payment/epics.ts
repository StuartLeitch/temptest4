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
  getClientToken,
  recordCardPayment,
  createPayPalOrder,
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
    map((r) => {
      return getPaymentMethods.success(r.data.getPaymentMethods);
    }),
  );
};

const getClientTokenEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(getClientToken.request)),
    switchMap(() => graphqlAdapter.send(queries.getClientToken)),
    map((r) => {
      return getClientToken.success(r.data.getClientToken);
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
    switchMap((action) => {
      const {
        paymentMethodId,
        invoiceId,
        payerId,
        paymentMethodNonce,
        amount,
      } = action.payload;

      return graphqlAdapter.send(mutations.creditCardPayment, {
        invoiceId,
        payerId,
        paymentMethodId,
        paymentMethodNonce,
        amount,
      });
    }),
    withLatestFrom(state$.pipe(map(invoice))),
    mergeMap(([r, invoice]) => {
      return from([
        recordCardPayment.success(r.data.creditCardPayment),
        getInvoice.request(invoice.invoiceId),
      ]);
    }),
    catchError((err) => of(recordCardPayment.failure(err.message))),
  );
};

const recordPayPalPaymentEpic: RootEpic = (
  action$,
  state$,
  { graphqlAdapter },
) => {
  return action$.pipe(
    filter(isActionOf(recordPayPalPayment.request)),
    switchMap((action) => {
      const { invoiceId } = action.payload;
      return graphqlAdapter.send(mutations.recordPayPalPayment, {
        invoiceId,
      });
    }),
    withLatestFrom(state$.pipe(map(invoice))),
    mergeMap(([r, invoice]) => {
      return from([
        recordPayPalPayment.success(""),
        getInvoice.request(invoice.invoiceId),
      ]);
    }),
    catchError((err) => of(recordPayPalPayment.failure(err.message))),
  );
};

const createPayPalOrderEpic: RootEpic = (
  action$,
  state$,
  { graphqlAdapter },
) => {
  return action$.pipe(
    filter(isActionOf(createPayPalOrder.request)),
    switchMap((action) => {
      const { invoiceId } = action.payload;
      return graphqlAdapter.send(mutations.createPayPalOrder, { invoiceId });
    }),
    map((r) => {
      return createPayPalOrder.success(r.data.createPayPalOrder.id);
    }),
    catchError((err) => of(createPayPalOrder.failure(err.message))),
  );
};

export default [
  recordPayPalPaymentEpic,
  getPaymentsMethodsEpic,
  getClientTokenEpic,
  creditCardPaymentEpic,
  createPayPalOrderEpic,
];
