import { RootEpic, isActionOf } from "typesafe-actions";
import {
  map,
  delay,
  mapTo,
  filter,
  switchMap,
  ignoreElements,
} from "rxjs/operators";

import { mutations } from "./graphql";
import { updatePayerAsync } from "./actions";
import { modalActions } from "../../../providers/modal";

const updatePayerEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(updatePayerAsync.request)),
    delay(1000),
    mapTo(updatePayerAsync.failure("network error")),

    // switchMap(action => {
    //   return graphqlAdapter.send(mutations.createPayer, action.payload);
    // }),
    // map(r => {
    //   console.log("createPayer response -> ", r);
    // }),
  );
};

export default [updatePayerEpic];
