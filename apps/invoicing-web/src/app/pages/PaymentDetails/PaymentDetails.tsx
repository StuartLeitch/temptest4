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

const articleDetails = {
  journalTitle: "Parkinson's Disease",
  title:
    "A Key Major Guideline for Engineering Bioactive Multicomponent Nanofunctionalization for Biomedicine and Other Applications: Fundamental Models Confirmed by Both Direct and Indirect Evidence",
  id: 2016970,
  type: "Research Article",
  ccLicense: "CC-BY 4.0",
  correspondingAuthor: "Patrick M. Sullivan",
  authors: [
    "Patrick M. Sullivan",
    "Patrick M. Sullivan1",
    "Patrick M. Sullivan2",
    "Patrick M. Sullivan3",
  ],
};

const PaymentDetails: React.FunctionComponent<Props> = ({ createPayer }) => {
  const { invoiceId } = useParams();

  return (
    <Root>
      <button onClick={() => createPayer({ id: "123", name: "Aurel" })}>createPayer</button>
      <BillingInfo />
      <Details articleDetails={articleDetails} />
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
