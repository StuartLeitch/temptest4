import { RootEpic, isActionOf } from "typesafe-actions";
import { ignoreElements, filter, switchMap, map } from "rxjs/operators";

import { getInvoice } from "./actions";
import { queries } from "./graphql";

const fetchInvoiceEpic: RootEpic = (action$, state$, { graphqlAdapter }) =>
  action$.pipe(
    filter(isActionOf(getInvoice.request)),
    switchMap(action => graphqlAdapter.send(queries.getInvoice, { id: action.payload })),
    map(r => {
      console.log("the response", r);
    }),
    ignoreElements(),
  );

export default [fetchInvoiceEpic];
