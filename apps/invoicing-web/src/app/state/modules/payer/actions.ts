import { createAsyncAction } from "typesafe-actions";

import { Payer, PayerInput } from "./types";

export const createPayerAsync = createAsyncAction(
  "payer/CREATE_REQUEST",
  "payer/CREATE_ERROR",
  "payer/CREATE_SUCCESS",
)<PayerInput, Payer, string>();

