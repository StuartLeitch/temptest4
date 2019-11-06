import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "@hindawi/react-components";

import App from "./app/app";
import { AuthService } from './app/services/authService';
import { config } from './config';
import axios from 'axios';

const authService = new AuthService(config);
authService.init();
authService.$state.subscribe((s) => {
  if (s.session) {
    axios.get(`${config.apiRoot}/jwt-test`, {
      params: {
        token: s.session.token
      }
    }).then(r => console.log(r.data));
  }
});

import { config } from './config';
import { Context } from './app/context';
import { makeStore } from "./app/state";

const context = new Context();
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
);
