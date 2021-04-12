import {
  withLatestFrom,
  catchError,
  switchMap,
  mergeMap,
  take,
  filter,
  map,
  tap,
  takeUntil
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
) => action$.pipe(
    // tap(ev => console.info(ev)),
    // filter(isActionOf(recordCardPayment.request)),
    // switchMap((action) => {
    //   const {
    //     invoiceId,
    //     payerId,
    //     paymentMethodId,
    //     paymentMethodNonce,
    //     amount,
    //   } = action.payload;

    //   return graphqlAdapter.send(mutations.creditCardPayment, {
    //     invoiceId,
    //     payerId,
    //     paymentMethodId,
    //     paymentMethodNonce,
    //     amount,
    //   });
    // }),
    // withLatestFrom(state$.pipe(map(invoice))),
    // mergeMap(([r, invoice]) => {
    //   return from([
    //     recordCardPayment.success(r.data.creditCardPayment),
    //     getInvoice.request(invoice.invoiceId),
    //   ]);
    // }),
    // // takeUntil(action$.pipe(filter(isActionOf(recordCardPayment.failure)))),
    // // take(1),
    // catchError((err) => of(recordCardPayment.failure(err.message))),
    filter(isActionOf(recordCardPayment.request)),
    switchMap((action) =>
      from(graphqlAdapter.send(mutations.creditCardPayment, action.payload)).pipe(
        map(recordCardPayment.success),
        catchError(err => {
          return of(recordCardPayment.failure(err.message));
        })
      )
    )
  );

const recordPayPalPaymentEpic: RootEpic = (
  action$,
  state$,
  { graphqlAdapter },
) => {
  return action$.pipe(
    filter(isActionOf(recordPayPalPayment.request)),
    switchMap((action) => {
      const { invoiceId, orderId } = action.payload;
      return graphqlAdapter.send(mutations.recordPayPalPayment, {
        invoiceId,
        orderId,
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

export default [
  recordPayPalPaymentEpic,
  getPaymentsMethodsEpic,
  getClientTokenEpic,
  creditCardPaymentEpic,
];
