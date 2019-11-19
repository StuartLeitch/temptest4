import { ajax } from "rxjs/ajax";
import { RootEpic, isActionOf } from "typesafe-actions";
import { of } from "rxjs";
import { filter, switchMap, map, catchError } from "rxjs/operators";

import { recordPayPalPayment } from "./actions";

const recordPayPalPaymentEpic: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(isActionOf(recordPayPalPayment.request)),
    switchMap(action =>
      ajax.post(
        `./api/paypal-payment/${action.payload.payerId}/${action.payload.payPalPaymentId}`,
      ),
    ),
    map(r => {
      return recordPayPalPayment.success("");
    }),
    catchError(err => of(recordPayPalPayment.failure(err.message))),
  );
};

export default [recordPayPalPaymentEpic];
