import React from "react";
import styled from "styled-components";
import { th, Expander } from "@hindawi/react-components";

import InvoiceForm from "./InvoiceForm";
import InvoiceInfo from "./InvoiceInfo";

interface Props {
  payer: any;
  error: string;
  loading: boolean;
  status: "DRAFT" | "ACTIVE" | "FINAL";
  handleSubmit(payer: any): any;
}

const BillingInfo: React.FC<Props> = ({
  payer,
  error,
  status,
  loading,
  handleSubmit,
}) => {
  return (
    <Expander
      mb={6}
      flex={2}
      expanded={true}
      title={status === "ACTIVE" ? "1. Invoice details" : "1. Payer details"}
    >
      <Root>
        {status === "ACTIVE" ? (
          <InvoiceInfo {...payer} />
        ) : (
          <InvoiceForm
            payer={payer}
            error={error}
            loading={loading}
            handleSubmit={handleSubmit}
          />
        )}
      </Root>
    </Expander>
  );
};

export default BillingInfo;

// #region styles
const Root = styled.div`
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  padding: calc(${th("gridUnit")} * 4);
  width: 100%;
`;
// #endregion
