import { createAsyncAction } from "typesafe-actions";

import { PayPalPayment } from "./types";

export const recordPayPalPayment = createAsyncAction(
  "payment/RECORD_PAY_PAL_REQUEST",
  "payment/RECORD_PAY_PAL_SUCCESS",
  "payment/RECORD_PAY_PAL_ERROR",
)<PayPalPayment, string, string>();
