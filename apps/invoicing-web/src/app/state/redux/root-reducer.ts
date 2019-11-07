import { combineReducers } from "redux";

import payerReducer from "../modules/payer/reducers";
import invoiceReducer from "../modules/invoice/reducers";

const rootReducer = combineReducers({
  payer: payerReducer,
  invoice: invoiceReducer,
});

export default rootReducer;
