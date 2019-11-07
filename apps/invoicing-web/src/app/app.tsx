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
          <Link to="/payment-details/e23b6c52-eee8-4ca9-bfec-5c9a9d8b00c9">
            To payment details
          </Link>
        )}
      />

      <Route path="/payment-details/:invoiceId" component={PaymentDetails} />
    </div>
  );
};

export default App;
