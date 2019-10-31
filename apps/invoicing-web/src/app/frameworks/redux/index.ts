import { combineReducers, applyMiddleware, createStore, compose } from "redux";
import { createLogger } from "redux-logger";
import { combineEpics, createEpicMiddleware } from "redux-observable";

import {
  manuscriptRedux,
  appRedux,
  userRedux,
  invoiceRedux,
  payerRedux,
} from "../../state-management/redux";

const { manuscript, fetchManuscriptEpic } = manuscriptRedux;
const { app, initEpic } = appRedux;
const { user, fetchUsersEpic } = userRedux;
const { invoice, fetchInvoiceEpic } = invoiceRedux;
const { payer, createPaymentEpic, paymentDoneEpic, createPaypalPaymentEpic } = payerRedux;

export const rootEpic = combineEpics(
  fetchManuscriptEpic,
  initEpic,
  fetchUsersEpic,
  fetchInvoiceEpic,
  createPaymentEpic,
  paymentDoneEpic,
  createPaypalPaymentEpic,
);
export const rootReducer = combineReducers({
  manuscript,
  app,
  user,
  invoice,
  payer,
});

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const configureStore = () => {
  const middleware = [];
  const epicMiddleware = createEpicMiddleware();

  middleware.push(epicMiddleware);
  if (false && process.env.NODE_ENV !== "production") {
    middleware.push(createLogger());
  }

  const store = createStore(rootReducer, composeEnhancers(applyMiddleware(...middleware)));

  epicMiddleware.run(rootEpic);
  return store;
};
