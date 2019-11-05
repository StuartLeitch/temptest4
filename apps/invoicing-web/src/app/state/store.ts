import { compose, applyMiddleware, createStore, combineReducers } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { gqlAdapter, restAdapter } from "./utils";

import payer, { payerEpics } from "./modules/payer";
import invoice, { invoiceEpics } from "./modules/invoice";
import manuscript, { manuscriptEpics } from "./modules/manuscript";

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const createReduxStore = () => {
  const middleware = [];

  const epicMiddleware = createEpicMiddleware({
    dependencies: {
      gqlAdapter,
      restAdapter,
    },
  });
  middleware.push(epicMiddleware);

  const store = createStore(
    combineReducers({
      payer,
      invoice,
      manuscript,
    }),
    composeEnhancers(applyMiddleware(...middleware)),
  );

  epicMiddleware.run(combineEpics(...invoiceEpics, ...manuscriptEpics, ...payerEpics));

  return store;
};

export default createReduxStore();
