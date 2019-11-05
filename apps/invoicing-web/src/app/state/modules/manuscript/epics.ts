import { ofType } from "redux-observable";
import { ignoreElements, tap } from "rxjs/operators";

import CONSTANTS from "./constants";

const fetchManuscriptEpic = (action$: any) =>
  action$.pipe(
    ofType(CONSTANTS.FETCH),
    tap(() => console.log("fetching manuscript...")),
    ignoreElements(),
  );

export default [fetchManuscriptEpic];
