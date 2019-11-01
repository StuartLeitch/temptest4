import { ofType } from "redux-observable";
import { of } from "rxjs";
import { mergeMap } from "rxjs/operators";

import CONSTANTS from "./constants";

// * Action Creators
const initAppFulfilled = app => ({
  type: CONSTANTS.INIT_FULFILLED,
  app,
});

interface InitActionType {
  type: string;
  app?: any;
}

export const appInitAction = (): InitActionType => ({
  type: CONSTANTS.INIT,
});

// * epic
export const initEpic = (action$: any) =>
  action$.pipe(
    ofType(CONSTANTS.INIT),
    mergeMap((action: InitActionType) => {
      return of(initAppFulfilled({ foo: "bau-bau" }));
    }),
  );
