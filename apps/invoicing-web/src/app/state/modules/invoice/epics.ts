import { RootEpic, isActionOf } from "typesafe-actions";
import { of } from "rxjs";
import { map, filter, switchMap, catchError, delay } from "rxjs/operators";

import { getInvoice } from "./actions";
import { queries } from "./graphql";

const fetchInvoiceEpic: RootEpic = (action$, state$, { graphqlAdapter }) =>
  action$.pipe(
    filter(isActionOf(getInvoice.request)),
    delay(1000),
    switchMap(action =>
      graphqlAdapter.send(queries.getInvoice, { id: action.payload }),
    ),
    map(r => getInvoice.success({ id: "123" })),
    catchError(err => of(getInvoice.failure(err.message))),
  );

export default [fetchInvoiceEpic];
