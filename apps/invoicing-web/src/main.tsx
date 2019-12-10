import React from "react";
import ReactDOM from "react-dom";

import { App } from "./app/app";
import { config } from "./config";
import { Context } from "./context";
import { makeStore } from "./app/state";
import { getInvoices } from "./app/state/modules/invoice/actions";

import AppProviders from "./app/contexts";

const context = new Context(config);
const store = makeStore(config, context);

ReactDOM.render(
  <AppProviders store={store}>
    <App />
  </AppProviders>,
  document.getElementById("root"),
  () => {
    store.dispatch(
      getInvoices.request({ offset: 0, limit: config.invoicesPerPage }),
    );
  },
);
