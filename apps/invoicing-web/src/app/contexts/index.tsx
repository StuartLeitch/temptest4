import React from "react";

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "@hindawi/react-components";

import { AuthProvider } from "./Auth";
import { UserProvider } from "./User";

function AppProviders({ store, children }) {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <UserProvider>{children}</UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default AppProviders;
