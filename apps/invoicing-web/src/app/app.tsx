import React from "react";
import { Link, Route } from "react-router-dom";

import { PaymentDetails } from "./pages/PaymentDetails";

export const App = () => {
  return (
    <div>
      <Link to="/payment-details/invoice-1">to payment details</Link>
      <Route path="/payment-details/:invoiceId" component={PaymentDetails} />
    </div>
  );
};

export default App;
