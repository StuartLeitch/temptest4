import React from "react";
import Steps from "antd/lib/steps";

const { Step } = Steps;

export const PaymentSteps = ({ onChange, current }) => (
  <Steps current={current} onChange={onChange}>
    <Step title="Choose Payer" description="Choose payer(s)." />
    <Step title="Billing Address" description="Enter billing address." />
    {/* <Step title="Confirm" description="Confirm information." /> */}
    <Step title="Invoice &amp; Payment" description="Checkout." />
  </Steps>
);
