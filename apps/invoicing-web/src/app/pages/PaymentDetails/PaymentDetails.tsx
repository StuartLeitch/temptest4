import React from "react";
import { useParams } from "react-router-dom";

import { BillingInfo } from "./BillingInfo";

interface Props {}

const PaymentDetails: React.FunctionComponent<Props> = () => {
  const { invoiceId } = useParams();

  return (
    <div>
      payment details should be here
      <BillingInfo />
    </div>
  );
};

export default PaymentDetails;
