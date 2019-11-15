import { isActionOf, RootEpic } from "typesafe-actions";
import { filter, switchMap, map } from "rxjs/operators";

import { queries } from "./graphql";
import { getPaymentMethods } from "./actions";

const getPaymentsMethodsEpic: RootEpic = (
  action$,
  state$,
  { graphqlAdapter },
) => {
  return action$.pipe(
    filter(isActionOf(getPaymentMethods.request)),
    switchMap(() => graphqlAdapter.send(queries.getPaymentMethods)),
    map(r => {
      return getPaymentMethods.success(r.data.getPaymentMethods);
    }),
  );
};

export default [getPaymentsMethodsEpic];
