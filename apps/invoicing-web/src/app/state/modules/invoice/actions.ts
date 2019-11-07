import { createAsyncAction } from "typesafe-actions";

import { Invoice } from "./types";

export const getInvoice = createAsyncAction(
  "invoice/GET_REQUEST",
  "invoice/GET_SUCCESS",
  "invoice/GET_ERROR",
)<string, Invoice, string>();
