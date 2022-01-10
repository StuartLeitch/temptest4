import { RootEpic, isActionOf, action } from "typesafe-actions";
import { of, from, interval } from "rxjs";
import {
  map,
  delay,
  filter,
  mergeMap,
  switchMap,
  catchError,
  withLatestFrom,
  tap,
  debounce,
} from "rxjs/operators";
import { modalActions } from "../../../providers/modal";

import { reductions, invoice } from "./selectors";
import { queries, mutations } from "./graphql";
import {
  getInvoice,
  getInvoices,
  updatePayerAsync,
  getInvoiceVat,
  applyCouponAction,
} from "./actions";

const fetchInvoiceEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(getInvoice.request)),
    delay(250),
    switchMap((action) =>
      graphqlAdapter.send(queries.getInvoice, { id: action.payload }),
    ),
    withLatestFrom(state$.pipe(map(invoice))),
    mergeMap(([r, stateInvoice]) => {
      const invoice = r.data.invoice;
      const { article, ...invoiceItem } = invoice.invoiceItem;

      return from([
        modalActions.hideModal(),
        getInvoice.success({
          ...invoice,
          invoiceItem,
          article,
        })
      ]);
    }),
    catchError((err) => of(getInvoice.failure(err.message))),
  );
};

const updatePayerEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(updatePayerAsync.request)),
    switchMap((action) => {
      return graphqlAdapter.send(mutations.confirmInvoice, {
        payer: action.payload,
      });
    }),
    withLatestFrom(state$.pipe(map(invoice))),
    mergeMap(([r, invoice]) => {
      return from([
        modalActions.hideModal(),
        updatePayerAsync.success(r.data.updateInvoicePayer),
        getInvoice.request(invoice.invoiceId),
      ]);
    }),
    catchError((err) => {
      return of(updatePayerAsync.failure(err.message));
    }),
  );
};

const getInvoiceVatEpic: RootEpic = (action$, _, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(getInvoiceVat.request)),
    delay(500),
    debounce(() => interval(300)),
    switchMap((action) => {
      return from(
        graphqlAdapter.send(queries.getInvoiceVat, action.payload),
      ).pipe(
        mergeMap((r) => from([getInvoiceVat.success(r.data.invoiceVat)])),
        catchError((err) => of(getInvoiceVat.failure(err.message))),
      );
    }),
  );
};

const applyCouponEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(applyCouponAction.request)),
    switchMap((action) =>
      from(
        graphqlAdapter.send(mutations.applyCoupon, {
          invoiceId: action.payload.invoiceId,
          couponCode: action.payload.couponCode,
        }),
      ).pipe(
        withLatestFrom(state$.pipe(map(invoice)), state$.pipe(map(reductions))),
        mergeMap(([r, invoice, reductions]) => {
          let returnPipe: any[] = [
            applyCouponAction.success(r.data.applyCoupon),
          ];

          let totalReduction: number =
            reductions.reduce((acc, curr) => acc + curr.reduction, 0) +
            r.data.applyCoupon.reduction;

          if (totalReduction >= 100) {
            returnPipe.push(getInvoice.request(invoice.invoiceId));
          }
          return from(returnPipe);
        }),
        catchError((error) => of(applyCouponAction.failure(error.message))),
      ),
    ),
  );
};

export default [
  fetchInvoiceEpic,
  updatePayerEpic,
  getInvoiceVatEpic,
  applyCouponEpic,
];
