import { combineReducers } from "redux";

import { reducers } from "../app/redux";

const rootReducer = {};

for (let x in reducers) {
  rootReducer[x] = reducers[x];
}

export default combineReducers(rootReducer);
