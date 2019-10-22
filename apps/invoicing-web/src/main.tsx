import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./app/app";

import { configureStore } from "./app/frameworks/redux";

// import { TRANSACTIONS_FEATURE_KEY, transactionsReducer } from "./app/transactions.slice";
// const store = configureStore({
//   reducer: { [TRANSACTIONS_FEATURE_KEY]: transactionsReducer },
// });

ReactDOM.render(
  <Provider store={configureStore()}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root"),
);
