import { createAsyncAction } from "typesafe-actions";

export const getInvoice = createAsyncAction(
  "invoice/GET_REQUEST",
  "invoice/GET_ERROR",
  "invoice/GET_SUCCESS",
)<string, any, any>();
