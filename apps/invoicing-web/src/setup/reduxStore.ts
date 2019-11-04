import { compose, applyMiddleware, createStore } from "redux";
import { createEpicMiddleware } from "redux-observable";

import rootEpic from "./rootEpic";
import rootReducer from "./rootReducer";
import { gqlAdapter, restAdapter } from "./networkAdapters";

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

  const store = createStore(rootReducer, composeEnhancers(applyMiddleware(...middleware)));

  epicMiddleware.run(rootEpic);

  return store;
};

export default createReduxStore();
