import { combineReducers } from "redux";

import payerReducer from "../modules/payer/reducers";
import invoiceReducer from "../modules/invoice/reducers";

import { modalReducer } from "../../providers/modal";

const rootReducer = combineReducers({
  payer: payerReducer,
  modal: modalReducer,
  invoice: invoiceReducer,
});

export default rootReducer;
