import React from "react";
import { Link, Route } from "react-router-dom";

import { Header } from "./components/Header";
import { PaymentDetails } from "./pages/PaymentDetails";

export const App = () => {
  return (
    <div>
      <Header path="Payment Details"></Header>
      <Route
        path="/"
        exact
        component={() => (
          <Link to="/payment-details/invoice-1">To payment details</Link>
        )}
      />

      <Route path="/payment-details/:invoiceId" component={PaymentDetails} />
    </div>
  );
};

export default App;
