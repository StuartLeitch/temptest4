import { InvoiceState } from "./types";

const initialState: InvoiceState = {
  invoice: null,
  error: null,
  loading: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};
