import { combineEpics } from "redux-observable";

import payerEpics from "../modules/payer/epics";
import invoiceEpics from "../modules/invoice/epics";

export default combineEpics(...payerEpics, ...invoiceEpics);
