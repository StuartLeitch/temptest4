import { createAsyncAction } from "typesafe-actions";

import { Invoice, Payer } from "./types";

export const getInvoice = createAsyncAction(
  "invoice/GET_REQUEST",
  "invoice/GET_SUCCESS",
  "invoice/GET_ERROR",
)<string, Invoice, string>();

export const updatePayerAsync = createAsyncAction(
  "invoice/UPDATE_PAYER_REQUEST",
  "invoice/UPDATE_PAYER_SUCCESS",
  "invoice/UPDATE_PAYER_ERROR",
)<Payer, Payer, string>();

export const getInvoices = createAsyncAction(
  "invoice/FETCH_INVOICES_REQUEST",
  "invoice/FETCH_INVOICES_SUCCESS",
  "invoice/FETCH_INVOICES_ERROR",
)<string, Invoice[], string>();
