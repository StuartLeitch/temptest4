import * as paymentsTypes from "./types";
import * as paymentsActions from "./actions";
import * as paymentsSelectors from "./selectors";

import payments from "./reducers";
import paymentsEpics from "./epics";

export { paymentsActions, paymentsEpics, paymentsSelectors, paymentsTypes };

export default payments;
