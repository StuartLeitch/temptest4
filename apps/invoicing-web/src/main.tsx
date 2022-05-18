import React from "react";
import ReactDOM from "react-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import { App } from "./app/app";
import { config } from "./config";
import { oneContext } from "./context";
import { makeStore } from "./app/state";

import AppProviders from "./app/contexts";

const ENV = config.env === "production" ? "production" : "sandbox";

const CLIENT = {
  production: config.paypallClientId,
  sandbox: config.paypallClientId,
};

const store = makeStore(config, oneContext);

ReactDOM.render(
  <PayPalScriptProvider
    options={{ "client-id": CLIENT[ENV], "disable-funding": "credit,card" }}
  >
    <AppProviders store={store}>
      <App />
    </AppProviders>
  </PayPalScriptProvider>,
  document.getElementById("root"),
);
