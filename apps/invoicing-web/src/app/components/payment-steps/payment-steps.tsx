import React from "react";
import Steps from "antd/es/steps";

const { Step } = Steps;

export const PaymentSteps = ({ onChange, current }) => (
  <Steps current={current} type="navigation" onChange={onChange}>
    <Step title="Choose Payer" description="Choose payer(s)." />
    <Step title="Billing Address" description="Enter billing address." />
    {/* <Step title="Confirm" description="Confirm information." /> */}
    <Step title="Invoice &amp; Payment" description="Checkout." />
  </Steps>
);
