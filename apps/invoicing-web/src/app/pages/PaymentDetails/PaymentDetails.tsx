import React from "react";
import { useParams } from "react-router-dom";

import { BillingInfo } from "./BillingInfo";
import { Details } from "./Details";

interface Props {}

const PaymentDetails: React.FunctionComponent<Props> = () => {
  const { invoiceId } = useParams();

  return (
    <div>
      <BillingInfo />
      <Details />
    </div>
  );
};

export default PaymentDetails;
