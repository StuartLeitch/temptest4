import { combineEpics } from "redux-observable";

import { paymentEpics } from "../modules/payment";
import { invoiceEpics } from "../modules/invoice";

export default combineEpics(...invoiceEpics, ...paymentEpics);
