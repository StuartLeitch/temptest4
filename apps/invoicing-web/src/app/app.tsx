import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";

import { config } from "../config";

import { useAuth } from "./contexts/Auth";
// import { AuthClient } from "./utils/auth-client";

import { Header } from "./components/Header";
import { PaymentDetails } from "./pages/PaymentDetails";
import { NotFound } from "./pages/NotFound";
import { PendingLogging } from "./pages/PendingLogging/PendingLogging";

// import { useUser } from "./contexts/User";
const loadInvoicesList = () => import("./pages/InvoicesList/InvoicesList");
const InvoicesList = React.lazy(loadInvoicesList);

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
  const auth = useAuth();

  // * If auth is not enabled
  if (typeof auth === "object" && !auth) {
    return <React.Suspense fallback={null}>{children}</React.Suspense>;
  }

  let toRender = null;

  const { data, login } = auth;
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
