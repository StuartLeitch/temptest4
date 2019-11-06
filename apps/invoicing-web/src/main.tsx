import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "@hindawi/react-components";

import App from "./app/app";
import { config } from "./config";
import { Context } from "./context";
import { makeStore } from "./app/state";
import { actions } from "./app/state/modules/system";

const context = new Context(config);
const store = makeStore(config, context);

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>,
  document.getElementById("root"),
  () => {
    store.dispatch(actions.init());
  },
);
