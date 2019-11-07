import { RootEpic, isActionOf } from "typesafe-actions";
import { ignoreElements, filter, map, switchMap } from "rxjs/operators";

import { createPayerAsync } from "./actions";
import { mutations } from "./graphql";

const createPayerEpic: RootEpic = (action$, state$, { graphqlAdapter }) => {
  return action$.pipe(
    filter(isActionOf(createPayerAsync.request)),
    switchMap(action => {
      return graphqlAdapter.send(mutations.createPayer, action.payload);
    }),
    map(r => {
      console.log("createPayer response -> ", r);
    }),
    ignoreElements(),
  );
};

export default [createPayerEpic];
