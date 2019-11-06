import { RootEpic, isActionOf } from "typesafe-actions";
import { tap, ignoreElements, filter } from "rxjs/operators";

import { getInvoice } from "./actions";

const fetchInvoiceEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getInvoice.request)),
    ignoreElements(),
  );

export default [fetchInvoiceEpic];
