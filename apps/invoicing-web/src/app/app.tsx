import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";

import { config } from "../config";

import { Header } from "./components/Header";
import { PaymentDetails } from "./pages/PaymentDetails";
import { NotFound } from "./pages/NotFound";

// import { useUser } from "./contexts/User";

export const App = () => {
  useEffect(() => {
    document.title = config.appName;

    const favicon: any = document.getElementById("favicon");
    favicon.href = config.faviconUrl;
  });

  return (
    <>
      <Header path="Payment Details" />
      <AppRoutes />
    </>
  );
};

function AppRoutes() {
  return (
    <Switch>
      <Route path="/payment-details/:invoiceId">
        <PaymentDetails />
      </Route>
      <Route path="*">
        <NotFound />
      </Route>
    </Switch>
  );
}
