import { createAsyncAction } from "typesafe-actions";

import { CreditCardInput, Payment, PaymentMethod } from "./types";

export const getPaymentMethods = createAsyncAction(
  "payments/GET_PAYMENT_METHODS_REQUEST",
  "payments/GET_PAYMENT_METHODS_SUCCESS",
  "payments/GET_PAYMENT_METHODS_ERROR",
)<CreditCardInput, PaymentMethod[], string>();

export const recordCardPayment = createAsyncAction(
  "payments/RECORD_CARD_REQUEST",
  "payments/RECORD_CARD_SUCCESS",
  "payments/RECORD_CARD_ERROR",
)<CreditCardInput, Payment, string>();
