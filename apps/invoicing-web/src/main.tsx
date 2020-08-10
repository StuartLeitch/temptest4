import React from "react";
import ReactDOM from "react-dom";

import { App } from "./app/app";
import { config } from "./config";
import { Context, oneContext } from "./context";
import { makeStore } from "./app/state";

import AppProviders from "./app/contexts";

// const context = new Context(config);
const store = makeStore(config, oneContext);

ReactDOM.render(
  <AppProviders store={store}>
    <App />
  </AppProviders>,
  document.getElementById("root"),
);
