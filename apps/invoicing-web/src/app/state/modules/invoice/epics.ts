import { RootEpic, isActionOf } from "typesafe-actions";
import { of } from "rxjs";
import {
  map,
  filter,
  switchMap,
  catchError,
  delay,
  mergeMap,
} from "rxjs/operators";

import { getInvoice } from "./actions";
import { queries } from "./graphql";

import { updatePayerAsync } from "../payer/actions";

const fetchInvoiceEpic: RootEpic = (action$, state$, { graphqlAdapter }) =>
  action$.pipe(
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

export default [fetchInvoiceEpic];
