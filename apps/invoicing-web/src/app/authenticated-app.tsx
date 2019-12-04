import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import { Header } from "./components/Header";
import { PaymentDetails } from "./pages/PaymentDetails";
import InvoicesList from "./pages/InvoicesList/InvoicesList";

function AuthenticatedApp() {
  return (
    <>
      <Header path="Payment Details" />
      <AuthenticatedRoutes />
    </>
  );
}

function AuthenticatedRoutes() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={InvoicesList} />
        <Route path="/payment-details/:invoiceId" component={PaymentDetails} />
      </Switch>
    </Router>
  );
}

export default AuthenticatedApp;
