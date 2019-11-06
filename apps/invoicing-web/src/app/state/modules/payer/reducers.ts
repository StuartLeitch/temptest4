import { createReducer } from "typesafe-actions";

import { Payer, PayerInput } from "./types";
import { createPayerAsync } from "./actions";

interface PayerState {
  payer: any;
  loading: boolean;
  error: any;
}

const initialState: PayerState = {
  payer: null,
  loading: false,
  error: null,
};

export default createReducer(initialState).handleAction(
  createPayerAsync.request,
  (state, action) => {
    console.log("se face un request", state, action);
    return state;
  },
);

// export default (state = initialState, action) => {
//   switch (action.type) {
//     default:
//       return state;
//   }
// };
