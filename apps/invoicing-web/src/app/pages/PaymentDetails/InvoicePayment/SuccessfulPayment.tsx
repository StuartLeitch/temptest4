import React, { Fragment } from "react";
import styled from "styled-components";
import { Flex, th, Separator, Title, Button } from "@hindawi/react-components";

interface Props {
  title?: string;
  onViewInvoice?: () => void;
}

const SuccessfulPayment: React.FunctionComponent<Props> = ({
  title = "Payment was sent successfuly",
  onViewInvoice,
}) => (
  <Flex alignItems="center" vertical flex={2}>
    <Flex vertical alignItems="center" style={{ padding: "40px" }}>
      <img
        src="../../assets/images/hindawi-payment-success.svg"
        alt="Success"
      />

      <div style={{ height: "30px" }}>
        <Separator direction="horizontal"></Separator>
      </div>
      <Title type="small">{title}</Title>
      <div style={{ height: "50px" }}>
        <Separator direction="horizontal"></Separator>
      </div>

      <Fragment>
        <Button type="primary" onClick={onViewInvoice} mr={3}>
          VIEW INVOICE
        </Button>
      </Fragment>
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
