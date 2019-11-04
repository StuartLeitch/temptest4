import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, useHistory, Link } from "react-router-dom";

import { Button } from "@hindawi/react-components";

import { appRedux, userRedux, manuscriptRedux, invoiceRedux } from "./state-management/redux";

const { appInitAction } = appRedux;
const { fetchUsersAction } = userRedux;
const { fetchManuscriptAction } = manuscriptRedux;
const { createInvoiceMailAction } = invoiceRedux;

// * pages
import PaymentWizard from "./pages/payment/payment-wizard";

// * payment screen
import { Payment } from "./Payments";

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

const SendMail = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <Button
        size="medium"
        onClick={() =>
          dispatch(
            createInvoiceMailAction({
              hello: "world",
            }),
          )
        }
      >
        SEND MAIL
      </Button>
    </div>
  );
};

const IndexComponent = () => (
  <div>
    <SendMail />
    <hr />
    <InvoiceCard />
  </div>
);

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

        <Link to="/new-paments">To payment</Link>
      </header>

      <Route path="/" exact component={IndexComponent} />
      <Route path="/new-paments" component={Payment} />
      <Route path="/payment/:invoiceId" component={PaymentWizard} />
    </div>
  );
};

export default App;
