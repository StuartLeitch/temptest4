import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { RootState } from "typesafe-actions";
import { useParams } from "react-router-dom";
import { Flex, Loader, Text, th } from "@hindawi/react-components";

import { Details } from "./Details";
import { BillingInfo } from "./BillingInfo";
import { InvoicePayment } from "./InvoicePayment";

import {
  invoiceTypes,
  invoiceActions,
  invoiceSelectors,
} from "../../state/modules/invoice";

import {
  payerTypes,
  payerActions,
  payerSelectors,
} from "../../state/modules/payer";

interface Props {
  invoiceError: string;
  invoiceLoading: boolean;
  invoice: invoiceTypes.Invoice | null;
  payer: payerTypes.Payer | null;
  payerError: string;
  payerLoading: boolean;
  getInvoice(id: string): any;
  createPayer(payer: payerTypes.PayerInput): any;
  showModal: any;
  hideModal: any;
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

const invoiceDetails = {
  terms: "Payable upon Receipt",
  referenceNumber: "617/2019",
  supplyDate: "xxxxxxxx",
  issueDate: "xxxxxxxx",
};

const charges = {
  items: [{ name: "Article Processing Charges", price: "$1,250.00" }],
  netTotal: "$1,250.00",
  vat: {
    percent: "20",
    value: "$250.00",
    details: "VAT amount in GBP is 109.04 GBP, 1 GBP = 1.6 USD",
  },
  total: "$4,500.00",
  warning: "UK VAT applies to this invoice, based on the country of the payer.",
};

const PaymentDetails: React.FunctionComponent<Props> = ({
  invoice,
  invoiceError,
  invoiceLoading,
  getInvoice,
  // payer
  payer,
  payerError,
  payerLoading,
  createPayer,
}) => {
  const { invoiceId } = useParams();

  useEffect(() => {
    getInvoice(invoiceId);
  }, []);

  if (invoiceError) {
    return (
      <Flex>
        <Text type="warning">{invoiceError}</Text>
      </Flex>
    );
  }

  if (invoiceLoading) {
    return (
      <Flex alignItems="center" vertical>
        <Text mb={2}>Fetching invoice...</Text>
        <Loader size={6} />
      </Flex>
    );
  }

  return (
    <Root>
      <FormsContainer>
        <BillingInfo
          payer={payer}
          error={payerError}
          handleSubmit={createPayer}
          loading={payerLoading}
        />
        <InvoicePayment />
      </FormsContainer>
      <Details
        articleDetails={articleDetails}
        invoiceDetails={invoiceDetails}
        charges={charges}
      />
    </Root>
  );
};

const mapStateToProps = (state: RootState) => ({
  invoice: invoiceSelectors.invoice(state),
  invoiceError: invoiceSelectors.invoiceError(state),
  invoiceLoading: invoiceSelectors.invoiceLoading(state),
  payer: payerSelectors.payer(state),
  payerError: payerSelectors.payerError(state),
  payerLoading: payerSelectors.payerLoading(state),
});

export default connect(
  mapStateToProps,
  {
    getInvoice: invoiceActions.getInvoice.request,
    createPayer: payerActions.updatePayerAsync.request,
  },
)(PaymentDetails);

// #region styles
const Root = styled.div`
  align-items: flex-start;
  display: flex;
  padding: calc(${th("gridUnit")} * 6) calc(${th("gridUnit")} * 8);
`;

const FormsContainer = styled.div`
  display: flex;
  flex: 2;
  flex-direction: column;
  margin-right: calc(${th("gridUnit")} * 4);
`;
// #endregion
