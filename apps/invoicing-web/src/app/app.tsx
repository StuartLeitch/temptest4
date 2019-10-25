import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import { useDispatch } from "react-redux";

import { appRedux, userRedux, manuscriptRedux } from "./state-management/redux";

const { appInitAction } = appRedux;
const { fetchUsersAction } = userRedux;
const { fetchManuscriptAction } = manuscriptRedux;

// * pages
import PaymentWizard from "./pages/payment/PaymentWizard";

// * app styles
import "./app.scss";

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

      <Route component={PaymentWizard} path="/payment/:invoiceId" />
    </div>
  );
};

export default App;
