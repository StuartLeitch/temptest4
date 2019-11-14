import { createAsyncAction } from "typesafe-actions";

import { Invoice, Payer, CreditCardInput, Payment } from "./types";

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

export const recordCardPayment = createAsyncAction(
  "payments/RECORD_CARD_REQUEST",
  "payments/RECORD_CARD_SUCCESS",
  "payments/RECORD_CARD_ERROR",
)<CreditCardInput, Payment, string>();
