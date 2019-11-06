import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { useParams } from "react-router-dom";

import { BillingInfo } from "./BillingInfo";
import { Details } from "./Details";

import { payerActions } from "../../state/modules/payer";

interface Props {
  createPayer: any;
}

const PaymentDetails: React.FunctionComponent<Props> = ({ createPayer }) => {
  const { invoiceId } = useParams();

  return (
    <Root>
      <button onClick={() => createPayer({ id: "123", name: "Aurel" })}>createPayer</button>
      <BillingInfo />
      <Details />
    </Root>
  );
};

export default connect(
  null,
  {
    createPayer: payerActions.createPayerAsync.request,
  },
)(PaymentDetails);

// #region styles
const Root = styled.div`
  display: flex;
`;
// #endregion
