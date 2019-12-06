import React, { useState, useEffect, useRef } from "react";
import scriptLoader from "react-async-script-loader";

import { config } from "../../../../config";

interface Props {
  total: number;
  currency?: string;
  isScriptLoaded: boolean;
  isScriptLoadSucceed: boolean;
  paymentMethodId: string;
  onError?(data?: any): void;
  onCancel?(data?: any): void;
  onSuccess?(data?: any): void;
}

const ENV = config.env === "production" ? "production" : "sandbox";

const CLIENT = {
  production: config.paypallClientId,
  sandbox: config.paypallClientId,
};

const Paypal: React.FunctionComponent<Props> = ({
  total,
  currency,
  onError,
  onCancel,
  onSuccess,
  isScriptLoaded,
  paymentMethodId,
  isScriptLoadSucceed,
}) => {
  let paypalRef = useRef();

  useEffect(() => {
    isScriptLoadSucceed &&
      isScriptLoaded &&
      (window as any).paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: currency,
                    value: total,
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            const payment = {
              paid: true,
              cancelled: false,
              payerID: data.payerID,
              orderID: data.orderID,
              paymentMethodId,
            };
            onSuccess(payment);
          },
          onError,
          onCancel,
        })
        .render(paypalRef.current);
  }, [total, isScriptLoadSucceed, isScriptLoaded]);

  return isScriptLoadSucceed && isScriptLoaded && <div ref={paypalRef} />;
};

Paypal.defaultProps = {
  currency: "USD",
};

export default scriptLoader(
  `https://www.paypal.com/sdk/js?client-id=${CLIENT[ENV]}`,
)(Paypal);
