import { combineEpics } from "redux-observable";

import { epics } from "../app/redux";

export default combineEpics(...epics);
