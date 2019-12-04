import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import { Header } from "./components/Header";
import { PaymentDetails } from "./pages/PaymentDetails";
import { NotFound } from "./pages/NotFound";

function UnauthenticatedApp() {
  return (
    <>
      <Header path="Payment Details" />
      <UnauthenticatedRoutes />
    </>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Router>
      <Switch>
        <Route path="/payment-details/:invoiceId" component={PaymentDetails} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  );
}

export default UnauthenticatedApp;
