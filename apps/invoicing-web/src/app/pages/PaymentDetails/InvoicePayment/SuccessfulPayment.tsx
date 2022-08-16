import React, { Fragment } from "react";
import styled from "styled-components";
import { Flex, th, Separator, Title, Button } from "@hindawi/react-components";
import { config } from "@hindawi/invoicing-web/config";

interface Props {
  title?: string;
  payerId: string;
  paymentType: string;
  onViewInvoice?: () => void;
}

const CREDIT_CARD = "Credit Card";

const SuccessfulPayment: React.FunctionComponent<Props> = ({
  title = "Payment was sent successfully",
  onViewInvoice,
  payerId,
  paymentType,
}) => (
  <Flex alignItems="center" vertical flex={2}>
    <Flex vertical alignItems="center" style={{ padding: "40px" }}>
      <img
        src="../../assets/images/hindawi-payment-success.webp"
        alt="Success"
        style={{ height: "111px" }}
      />

      <div style={{ height: "30px" }}>
        <Separator direction="horizontal"></Separator>
      </div>
      <Title type="small">{title}</Title>
      <div style={{ height: "25px" }}>
        <Separator direction="horizontal"></Separator>
      </div>

      {isCreditCardPayment(paymentType) && downloadReceipt(payerId)}
    </Flex>
  </Flex>
);

export default SuccessfulPayment;

const CardContainer = styled(Flex)`
  background-color: ${th("colors.background")};
  border-radius: ${th("gridUnit")};
  padding: 0 calc(${th("gridUnit")} * 4);
  padding-top: calc(${th("gridUnit")} * 3);
`;

function isCreditCardPayment(paymentType: string) {
  return paymentType === CREDIT_CARD;
}

function downloadReceipt(payerId: string) {
  return (
    <Fragment>
      <a href={`${config.apiRoot}/receipt/${payerId}`}>
        <Button type="primary" size="large" onClick={null} mr={3} mt={0}>
          Download Receipt
        </Button>
      </a>
    </Fragment>
  );
}
