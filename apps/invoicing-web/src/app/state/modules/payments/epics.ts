import { of } from "rxjs";
import { isActionOf, RootEpic } from "typesafe-actions";
import { filter, switchMap, map, catchError } from "rxjs/operators";

import { queries, mutations } from "./graphql";
import { getPaymentMethods, recordCardPayment } from "./actions";

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

const creditCardPaymentEpic: RootEpic = (
  action$,
  state$,
  { graphqlAdapter },
) => {
  return action$.pipe(
    filter(isActionOf(recordCardPayment.request)),
    switchMap(action => {
      const { invoiceId, paymentMethodId, ...creditCard } = action.payload;
      return graphqlAdapter.send(mutations.creditCardPayment, {
        invoiceId,
        paymentMethodId,
        creditCard,
      });
    }),
    map(r => {
      return recordCardPayment.success(r.data.creditCardPayment);
    }),
    catchError(err => of(recordCardPayment.failure(err.message))),
  );
};

export default [creditCardPaymentEpic, getPaymentsMethodsEpic];
