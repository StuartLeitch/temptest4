import React, { Fragment } from "react";
import styled from "styled-components";
import { Flex, th, Separator, Title, Button } from "@hindawi/react-components";
import { config } from "@hindawi/invoicing-web/config";

interface Props {
  title?: string;
  payerId: string;
  onViewInvoice?: () => void;
}

const SuccessfulPayment: React.FunctionComponent<Props> = ({
  title = "Payment was sent successfully",
  onViewInvoice,
  payerId,
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
      <div style={{ height: "50px" }}>
        <Separator direction="horizontal"></Separator>
      </div>

      <Fragment>
        <a href={`${config.apiRoot}/invoice/${payerId}`}>
          <Button type="primary" onClick={null} mr={3}>
            VIEW INVOICE
          </Button>
        </a>
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
