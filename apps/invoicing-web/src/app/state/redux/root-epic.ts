import { combineEpics } from "redux-observable";

import invoiceEpics from "../modules/invoice/epics";

export default combineEpics(...invoiceEpics);
