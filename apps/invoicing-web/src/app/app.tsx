import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { config } from "../config";

import { Header } from "./components/Header";
import { PaymentDetails } from "./pages/PaymentDetails";
import { NotFound } from "./pages/NotFound";

export const App = () => {
  useEffect(() => {
    document.title = config.appName;

    const favicon: any = document.getElementById("favicon");
    favicon.href = config.faviconUrl;
    const favicon2: any = document.getElementById("favicon2");
    favicon2.href = config.faviconUrl;
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
    <Routes>
      <Route path="/payment-details/:invoiceId" element={<PaymentDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
