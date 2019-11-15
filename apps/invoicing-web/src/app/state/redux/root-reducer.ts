import { combineReducers } from "redux";

import invoiceReducer from "../modules/invoice/reducers";

import { modalReducer } from "../../providers/modal";

const rootReducer = combineReducers({
  modal: modalReducer,
  invoice: invoiceReducer,
});

export default rootReducer;
