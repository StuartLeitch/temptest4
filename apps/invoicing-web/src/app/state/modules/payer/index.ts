import * as payerActions from "./actions";
import * as payerSelectors from "./selectors";
import * as payerTypes from "./types";

import payerEpics from "./epics";
import payer from "./reducers";

export { payerActions, payerEpics, payerSelectors, payerTypes };

export default payer;
