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
const { invoice, fetchInvoiceEpic, createInvoiceMailEpic } = invoiceRedux;
const {
  payer,
  createPaymentEpic,
  paymentDoneEpic,
  createPaypalPaymentEpic,
  createPayerEpic,
  paypalPaymentFulfilledEpic,
  updateAddressEpic,
} = payerRedux;

export const rootEpic = combineEpics(
  initEpic,
  fetchUsersEpic,
  createPayerEpic,
  paymentDoneEpic,
  fetchInvoiceEpic,
  createPaymentEpic,
  fetchManuscriptEpic,
  createInvoiceMailEpic,
  createPaypalPaymentEpic,
  paypalPaymentFulfilledEpic,
  updateAddressEpic,
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
