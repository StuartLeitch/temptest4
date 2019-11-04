import { ActionsObservable } from "redux-observable";
import { ignoreElements } from "rxjs/operators";

const fetchInvoiceEpic = (action$: ActionsObservable<any>) => action$.pipe(ignoreElements());
const payInvoiceEpic = (action$: ActionsObservable<any>) => action$.pipe(ignoreElements());

export default [fetchInvoiceEpic, payInvoiceEpic];
