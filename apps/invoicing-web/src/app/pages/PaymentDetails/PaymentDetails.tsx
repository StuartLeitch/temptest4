import React from "react";
import { useParams } from "react-router-dom";

interface Props {}

const PaymentDetails: React.FunctionComponent<Props> = () => {
  const { invoiceId } = useParams();
  
  return <div>payment details should be here</div>;
};

export default PaymentDetails;
