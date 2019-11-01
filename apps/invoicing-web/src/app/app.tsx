import React, { useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

import { appRedux, userRedux, manuscriptRedux } from "./state-management/redux";

const { appInitAction } = appRedux;
const { fetchUsersAction } = userRedux;
const { fetchManuscriptAction } = manuscriptRedux;

// * pages
import PaymentWizard from "./pages/payment/payment-wizard";

// * app styles
import "./app.scss";

const InvoiceCard = () => {
  const history = useHistory();
  return (
    <div className="invoice-card" onClick={() => history.push(`/payment/invoice-1/payer`)}>
      Pay invoice
    </div>
  );
};

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsersAction());
    dispatch(fetchManuscriptAction());
    dispatch(appInitAction());
  }, []);

  return (
    <div className="app">
      <header className="flex">
        <a href="#" className="logo">
          <img src="/assets/images/hindawi.svg" alt="Hindawi Publishing Corporation"></img>
        </a>
        <h1>Payment Details</h1>
      </header>

      <Route path="/" exact component={InvoiceCard} />
      <Route path="/payment/:invoiceId" component={PaymentWizard}  />
    </div>
  );
};

export default App;
