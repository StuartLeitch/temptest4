import { RootEpic, isActionOf } from "typesafe-actions";
import { of } from "rxjs";
import { map, filter, switchMap, catchError } from "rxjs/operators";

import { getInvoice } from "./actions";
import { queries } from "./graphql";

const fetchInvoiceEpic: RootEpic = (action$, state$, { graphqlAdapter }) =>
  action$.pipe(
    filter(isActionOf(getInvoice.request)),
    switchMap(action =>
      graphqlAdapter.send(queries.getInvoice, { id: action.payload }),
    ),
    map(r => getInvoice.success({ id: "123" })),
    catchError(err => of(getInvoice.failure(err.message))),
    // map(response => {
    //   console.log("the response -> ", response);
    //   return of(getInvoice.success(response.data));
    // }),
  );

export default [fetchInvoiceEpic];
