import { combineEpics } from "redux-observable";

import invoiceEpics from "../modules/invoice/epics";
import paymentEpics from "../modules/payment/epics";

export default combineEpics(...invoiceEpics, ...paymentEpics);
