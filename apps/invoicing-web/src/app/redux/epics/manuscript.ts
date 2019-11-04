import { ActionsObservable } from "redux-observable";
import { ignoreElements } from "rxjs/operators";

const fetchManuscriptEpic = (action$: ActionsObservable<any>) => action$.pipe(ignoreElements());
const submitManuscriptEpic = (action$: ActionsObservable<any>) => action$.pipe(ignoreElements());

export default [fetchManuscriptEpic, submitManuscriptEpic];
