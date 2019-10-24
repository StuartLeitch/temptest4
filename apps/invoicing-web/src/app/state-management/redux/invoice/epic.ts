import { ofType } from "redux-observable";
import { mergeMap, map } from "rxjs/operators";
const Axios = require("axios-observable").Axios;

import { InvoiceId, InvoiceMap } from "@hindawi/shared";

import CONSTANTS from "./constants";

// * Action Creators
const fetchInvoiceFulfilled = invoice => ({
  type: CONSTANTS.FETCH_FULFILLED,
  invoice,
});

interface InvoiceFetchActionType {
  type: string;
  invoiceId?: string;
}

export const fetchInvoiceAction = (invoiceId: string): InvoiceFetchActionType => ({
  type: CONSTANTS.FETCH,
  invoiceId,
});

// * epic
export const fetchInvoiceEpic = (action$: any) =>
  action$.pipe(
    ofType(CONSTANTS.FETCH),
    mergeMap((action: InvoiceFetchActionType) =>
      Axios.post(
        "http://localhost:4200/graphql",
        JSON.stringify({
          query: `query Invoice { Invoice(id: "${action.invoiceId}") { id, transactionId, status } }`,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      ).pipe(
        map((response: any) => {
          const invoice = InvoiceMap.toDomain(response.data.data.Invoice);
          return fetchInvoiceFulfilled({
            id: invoice.invoiceId.id.toString(),
            transactionId: invoice.transactionId.id.toString(),
            invoiceItems: invoice.invoiceItems,
            status: invoice.status,
          });
        }),
      ),
    ),
  );
