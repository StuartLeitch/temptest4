import { RootEpic, isActionOf } from "typesafe-actions";
import {
  map,
  delay,
  mapTo,
  filter,
  switchMap,
  ignoreElements,
  catchError,
} from "rxjs/operators";

import { mutations } from "./graphql";
import { updatePayerAsync } from "./actions";
import { modalActions } from "../../../providers/modal";
import { of } from "rxjs";
import { Payer } from "./types";

const payerId = "d57f51a5-bcc0-45eb-ad36-ad9d1f44e924";

const updatePayerEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(updatePayerAsync.request)),
    delay(1000),
    switchMap(action => {
      return graphqlAdapter.send(mutations.updateInvoicePayer, {
        payerId,
        payer: action.payload,
      });
    }),
    map(r => updatePayerAsync.success(r)),
    catchError(err => mapTo(updatePayerAsync.failure(err.message))),
  );
};

export default [updatePayerEpic];
