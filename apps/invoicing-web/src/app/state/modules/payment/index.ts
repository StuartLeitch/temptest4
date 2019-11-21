import * as paymentSelectors from "./selectors";
import * as paymentActions from "./actions";
import * as paymentTypes from "./types";

import payment from "./reducers";
import paymentEpics from "./epics";

export { paymentSelectors, paymentActions, paymentEpics, paymentTypes };

export default payment;
