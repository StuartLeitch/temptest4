import { of, from } from "rxjs";
import { RootEpic, isActionOf } from "typesafe-actions";
import {
  delay,
  mapTo,
  filter,
  switchMap,
  catchError,
  mergeMap,
  ignoreElements,
} from "rxjs/operators";

import { mutations } from "./graphql";
import { updatePayerAsync } from "./actions";
import { modalActions } from "../../../providers/modal";

const payerId = "d57f51a5-bcc0-45eb-ad36-ad9d1f44e924";

const updatePayerEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(updatePayerAsync.request)),
    switchMap(action => {
      const { id, ...payer } = action.payload;
      return graphqlAdapter.send(mutations.updateInvoicePayer, {
        payerId,
        payer,
      });
    }),
    mergeMap(r => {
      return from([
        modalActions.hideModal(),
        updatePayerAsync.success(r.data.updateInvoicePayer),
      ]);
    }),
    catchError(err => mapTo(updatePayerAsync.failure(err.message))),
  );
};

export default [updatePayerEpic];
