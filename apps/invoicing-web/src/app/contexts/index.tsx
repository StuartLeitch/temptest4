import React from "react";

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "@hindawi/react-components";

import { config } from "../../config";

import { AuthProvider } from "./Auth";
import { UserProvider } from "./User";

function AppProviders({ store, children }) {
  const { authEnabled } = config;
  const renderAuthProvider = () => {
    if (authEnabled) {
      return (
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      );
    } else {
      return children;
    }
  };
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProvider theme={theme}>{renderAuthProvider()}</ThemeProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default AppProviders;
