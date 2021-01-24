import React, { useState, useEffect, useRef } from "react";
import scriptLoader from "react-async-script-loader";

import { config } from "../../../../config";

interface Props {
  isScriptLoaded: boolean;
  isScriptLoadSucceed: boolean;
  onError?(data?: any): void;
  onCancel?(data?: any): void;
  onSuccess?(data?: any): void;
  createPayPalOrder(): Promise<string>;
}

const ENV = config.env === "production" ? "production" : "sandbox";

const CLIENT = {
  production: config.paypallClientId,
  sandbox: config.paypallClientId,
};

const Paypal: React.FunctionComponent<Props> = ({
  onError,
  onCancel,
  onSuccess,
  isScriptLoaded,
  isScriptLoadSucceed,
  createPayPalOrder,
}) => {
  const paypalRef = useRef();

  useEffect(() => {
    isScriptLoadSucceed &&
      isScriptLoaded &&
      (window as any).paypal
        .Buttons({
          style: {
            layout: "horizontal",
            label: "pay",
          },
          createOrder: async (data, actions) => {
            const a = await createPayPalOrder();
            return a;
          },
          onApprove: async (data, actions) => {
            onSuccess({ orderId: data.orderID });
          },
          onError,
          onCancel,
        })
        .render(paypalRef.current);
  }, [isScriptLoadSucceed, isScriptLoaded]);

  return isScriptLoadSucceed && isScriptLoaded && <div ref={paypalRef} />;
};

export default scriptLoader(
  `https://www.paypal.com/sdk/js?client-id=${CLIENT[ENV]}`,
)(Paypal);
