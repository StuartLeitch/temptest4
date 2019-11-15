import { combineEpics } from "redux-observable";

import { invoiceEpics } from "../modules/invoice";
import { paymentsEpics } from "../modules/payments";

export default combineEpics(...invoiceEpics, ...paymentsEpics);
