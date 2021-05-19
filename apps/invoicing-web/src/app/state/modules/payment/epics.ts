import {
  withLatestFrom,
  catchError,
  switchMap,
  mergeMap,
  filter,
  map,
} from "rxjs/operators";
import { isActionOf, RootEpic } from "typesafe-actions";
import { of, from } from "rxjs";

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
    filter(isActionOf(recordCardPayment.request)),
    switchMap((action) =>
      from(graphqlAdapter.send(mutations.creditCardPayment, action.payload)).pipe(
        withLatestFrom(state$.pipe(map(invoice))),
        mergeMap(([r, invoice]) => {
          return from([
            recordCardPayment.success(r.data.creditCardPayment),
            getInvoice.request(invoice.invoiceId),
          ]);
        }),
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
      return graphqlAdapter.send(mutations.recordPayPalPayment, action.payload);
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
