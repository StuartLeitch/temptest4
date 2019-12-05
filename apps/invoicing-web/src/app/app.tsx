import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";

import { config } from "../config";

// import { useUser } from "./contexts/User";
const loadInvoicesList = () => import("./pages/InvoicesList/InvoicesList");
const InvoicesList = React.lazy(loadInvoicesList);

import { useAuth } from "./contexts/Auth";
// import { AuthClient } from "./utils/auth-client";

import { Header } from "./components/Header";
import { PaymentDetails } from "./pages/PaymentDetails";
import { NotFound } from "./pages/NotFound";
import { PendingLogging } from "./pages/PendingLogging/PendingLogging";

export const App = () => {
  useEffect(() => {
    document.title = config.appName;
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
      <PrivateRoute path="/" exact>
        <InvoicesList />
      </PrivateRoute>
      <Route path="/payment-details/:invoiceId">
        <PaymentDetails />
      </Route>
      <Route path="*">
        <NotFound />
      </Route>
    </Switch>
  );
}

// A wrapper for <Route> that asks for authentication if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  const { data, login } = useAuth();

  let toRender = null;

  if (!data || !data.isAuthenticated) {
    // * Ask user to login!
    login();
  }

  if (data && "isAuthenticated" in data && data.isAuthenticated) {
    // pre-load the authenticated side in the background while the user's
    // filling out the login form.
    React.useEffect(() => {
      loadInvoicesList();
    }, []);
    toRender = (
      <React.Suspense fallback={<PendingLogging />}>{children}</React.Suspense>
    );
  }

  return <Route {...rest} render={() => toRender} />;
}
