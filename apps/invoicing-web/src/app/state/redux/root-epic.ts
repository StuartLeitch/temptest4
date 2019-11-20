import { combineEpics } from "redux-observable";

import paymentEpics from "../modules/payment/epics";

import { invoiceEpics } from "../modules/invoice";
import { paymentsEpics } from "../modules/payments";

export default combineEpics(...invoiceEpics, ...paymentsEpics);
