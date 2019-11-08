import { createAsyncAction } from "typesafe-actions";

import { Payer, PayerInput } from "./types";

export const updatePayerAsync = createAsyncAction(
  "payer/CREATE_REQUEST",
  "payer/CREATE_SUCCESS",
  "payer/CREATE_ERROR",
)<PayerInput, Payer, string>();
