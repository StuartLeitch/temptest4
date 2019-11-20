import React, { Fragment, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { RootState } from "typesafe-actions";
import { useParams } from "react-router-dom";
import { Flex, Loader, Text, th } from "@hindawi/react-components";

import { Details } from "./Details";
import { BillingInfo } from "./BillingInfo";
import { InvoicePayment } from "./InvoicePayment";
import { PaymentHeader } from "./PaymentHeader";

import { paymentActions, paymentTypes } from "../../state/modules/payment";
import {
  invoiceTypes,
  invoiceActions,
  invoiceSelectors,
} from "../../state/modules/invoice";

import {
  paymentsActions,
  paymentsSelectors,
} from "../../state/modules/payments";
import { PaymentMethod } from "../../state/modules/payments/types";

interface Props {
  invoiceError: string;
  invoiceLoading: boolean;
  invoice: invoiceTypes.Invoice | null;
  payerError: string;
  payerLoading: boolean;
  paymentError: string;
  paymentLoading: boolean;
  getMethodsError: string;
  getMethodsLoading: boolean;
  paymentMethods: Record<string, string>;
  getInvoice(id: string): any;
  updatePayer(payer: any): any;
  recordPayPalPayment(payment: paymentTypes.PayPalPayment): any;
  payWithCard(payload: any): any;
  getPaymentMethods(): any;
}

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

const recordPayment = (recordAction, invoice) => {
  return data => {
    return recordAction({
      payerId: invoice.payer.id,
      payPalOrderId: data.orderID,
      invoiceId: invoice.id,
    });
  };
};

const PaymentDetails: React.FunctionComponent<Props> = ({
  getInvoice,
  invoice,
  invoiceError,
  invoiceLoading,
  //
  updatePayer,
  payerError,
  payerLoading,
  //
  recordPayPalPayment,
  getPaymentMethods,
  payWithCard,
  paymentError,
  paymentLoading,
  paymentMethods,
}) => {
  const { invoiceId } = useParams();
  useEffect(() => {
    getInvoice(invoiceId);
    getPaymentMethods();
  }, []);

  const payByCard = useCallback(
    values => payWithCard({ invoiceId, ...values }),
    [invoiceId],
  );

  return (function() {
    if (invoiceError) {
      return (
        <Flex flex={2}>
          <Text type="warning">{invoiceError}</Text>
        </Flex>
      );
    }

    if (invoiceLoading) {
      return (
        <Flex alignItems="center" vertical flex={2}>
          <Text mb={2}>Fetching invoice...</Text>
          <Loader size={6} />
        </Flex>
      );
    }

    return (
      <Fragment>
        <PaymentHeader articleTitle={invoice.article.title} />
        <Root>
          <FormsContainer>
            <BillingInfo
              status={invoice.status}
              payer={invoice.payer}
              error={payerError}
              handleSubmit={updatePayer}
              loading={payerLoading}
            />
            <InvoicePayment
              payer={invoice.payer}
              methods={paymentMethods}
              error={paymentError}
              onSubmit={payByCard}
              loading={paymentLoading}
            />
          </FormsContainer>

          <Details invoice={invoice} mt={-44} />
        </Root>
      </Fragment>
    );
  })();
};

const mapStateToProps = (state: RootState) => ({
  invoice: invoiceSelectors.invoice(state),
  invoiceError: invoiceSelectors.invoiceError(state),
  invoiceLoading: invoiceSelectors.invoiceLoading(state),
  payerError: invoiceSelectors.payerError(state),
  payerLoading: invoiceSelectors.payerLoading(state),
  getMethodsError: paymentsSelectors.paymentMethodsError(state),
  getMethodsLoading: paymentsSelectors.paymentMethodsLoading(state),
  paymentMethods: paymentsSelectors.getPaymentMethods(state),
  paymentError: paymentsSelectors.recordPaymentError(state),
  paymentLoading: paymentsSelectors.recordPaymentLoading(state),
});

export default connect(
  mapStateToProps,
  {
    getInvoice: invoiceActions.getInvoice.request,
    updatePayer: invoiceActions.updatePayerAsync.request,
    recordPayPalPayment: paymentActions.recordPayPalPayment.request,
    payWithCard: paymentsActions.recordCardPayment.request,
    getPaymentMethods: paymentsActions.getPaymentMethods.request,
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
