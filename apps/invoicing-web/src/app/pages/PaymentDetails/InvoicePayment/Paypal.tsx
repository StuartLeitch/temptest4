import { usePayPalScriptReducer, PayPalButtons } from "@paypal/react-paypal-js";
import React from "react";

interface Props {
  createPayPalOrder(): Promise<string>;
  onSuccess?(data?: any): void;
  onCancel?(data?: any): void;
  onError?(data?: any): void;
}

const Paypal: React.FunctionComponent<Props> = ({
  createPayPalOrder,
  onSuccess,
  onCancel,
  onError,
}) => {
  const [{ isPending }] = usePayPalScriptReducer();

  return (
    !isPending && (
      <PayPalButtons
        createOrder={async () => {
          const a = await createPayPalOrder();
          return a;
        }}
        onApprove={async (data) => {
          onSuccess({ orderId: data.orderID });
        }}
        onError={onError}
        onCancel={onCancel}
      />
    )
  );
};

export default Paypal;
