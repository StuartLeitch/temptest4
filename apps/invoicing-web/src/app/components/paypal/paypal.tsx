import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import scriptLoader from "react-async-script-loader";

import { environment } from "../../../environments/environment";

interface Props {
  total: number;
  currency: string;
  isScriptLoaded: boolean;
  isScriptLoadSucceed: boolean;
  onError?(data?: any): void;
  onCancel?(data?: any): void;
  onSuccess?(data?: any): void;
}

const CLIENT = {
  sandbox: environment.PP_CLIENT_ID,
  production: `${environment.PP_CLIENT_ID}_prod`,
};
const ENV = environment.production ? "production" : "sandbox";

const Paypal: React.FunctionComponent<Props> = ({
  total,
  currency,
  onError,
  onCancel,
  onSuccess,
  isScriptLoaded,
  isScriptLoadSucceed,
}) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.React = React;
    window.ReactDOM = ReactDOM;
  }, []);

  useEffect(() => {
    if (!showButton && isScriptLoadSucceed && isScriptLoaded) {
      setShowButton(true);
    }
  }, [showButton, isScriptLoadSucceed, isScriptLoaded]);

  const payment = () =>
    (window as any).paypal.rest.payment.create(ENV, CLIENT, {
      transactions: [
        {
          amount: {
            total,
            currency,
          },
        },
      ],
    });

  const onAuthorize = (data, actions) =>
    actions.payment.execute().then(() => {
      const payment = {
        paid: true,
        cancelled: false,
        payerID: data.payerID,
        paymentID: data.paymentID,
        paymentToken: data.paymentToken,
        returnUrl: data.returnUrl,
      };
      onSuccess(payment);
    }, onError);

  const PaypalBtn = showButton && (window as any).paypal.Button.react;

  return (
    showButton && (
      <PaypalBtn
        env={ENV}
        commit={true}
        client={CLIENT}
        payment={payment}
        currency={currency}
        onError={onError}
        onCancel={onCancel}
        onAuthorize={onAuthorize}
      />
    )
  );
};

Paypal.defaultProps = {
  currency: "USD",
  total: 0.01,
};

export default scriptLoader("https://www.paypalobjects.com/api/checkout.js")(Paypal);
