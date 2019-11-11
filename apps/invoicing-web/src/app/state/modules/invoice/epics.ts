import { RootEpic, isActionOf } from "typesafe-actions";
import { of, from } from "rxjs";
import {
  delay,
  mapTo,
  filter,
  mergeMap,
  switchMap,
  catchError,
} from "rxjs/operators";
import { modalActions } from "../../../providers/modal";

import { queries, mutations } from "./graphql";
import { getInvoice, updatePayerAsync } from "./actions";

const fetchInvoiceEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(getInvoice.request)),
    delay(1000),
    switchMap(action =>
      graphqlAdapter.send(queries.getInvoice, { id: action.payload }),
    ),
    mergeMap(({ data }) => {
      const payer = data.data.invoice.payer;
      return [
        updatePayerAsync.success(payer),
        getInvoice.success(data.data.invoice),
      ];
    }),
    catchError(err => of(getInvoice.failure(err.message))),
  );
};

const payerId = "d57f51a5-bcc0-45eb-ad36-ad9d1f44e924";
const updatePayerEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(updatePayerAsync.request)),
    switchMap(action => {
      const { id, ...payer } = action.payload;
      return graphqlAdapter.send(mutations.updateInvoicePayer, {
        payerId,
        payer,
      });
    }),
    mergeMap(r => {
      return from([
        modalActions.hideModal(),
        updatePayerAsync.success(r.data.updateInvoicePayer),
      ]);
    }),
    catchError(err => mapTo(updatePayerAsync.failure(err.message))),
  );
};

export default [fetchInvoiceEpic, updatePayerEpic];
