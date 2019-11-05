import { ofType } from "redux-observable";
import { tap, ignoreElements } from "rxjs/operators";

import CONSTANTS from "./constants";

const fetchInvoiceEpic = (action$: any) =>
  action$.pipe(
    ofType(CONSTANTS.FETCH),
    tap(() => console.log("fetching invoice epic")),
    ignoreElements(),
  );

export default [fetchInvoiceEpic];
