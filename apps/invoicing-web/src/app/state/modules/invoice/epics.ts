import { RootEpic, isActionOf } from "typesafe-actions";
import { of, from } from "rxjs";
import {
  map,
  delay,
  filter,
  mergeMap,
  switchMap,
  catchError,
  withLatestFrom,
} from "rxjs/operators";
import { modalActions } from "../../../providers/modal";

import { invoice } from "./selectors";
import { queries, mutations } from "./graphql";
import { getInvoice, updatePayerAsync } from "./actions";

const fetchInvoiceEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(getInvoice.request)),
    delay(1000),
    switchMap(action =>
      graphqlAdapter.send(queries.getInvoice, { id: action.payload }),
    ),
    map(r => {
      const invoice = r.data.invoice;
      const { article, ...invoiceItem } = invoice.invoiceItem;

      return getInvoice.success({
        ...invoice,
        invoiceItem: { ...invoiceItem, vat: 20 },
        article,
      });
    }),
    catchError(err => of(getInvoice.failure(err.message))),
  );
};

const updatePayerEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(updatePayerAsync.request)),
    switchMap(action => {
      return graphqlAdapter.send(mutations.confirmInvoice, {
        payer: action.payload,
      });
    }),
    withLatestFrom(state$.pipe(map(invoice))),
    mergeMap(([r, invoice]) => {
      return from([
        modalActions.hideModal(),
        updatePayerAsync.success(r.data.updateInvoicePayer),
        getInvoice.request(invoice.id),
      ]);
    }),
    catchError(err => {
      return of(updatePayerAsync.failure(err.message));
    }),
  );
};

export default [fetchInvoiceEpic, updatePayerEpic];
