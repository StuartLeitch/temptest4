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
import { PaymentFooter } from "./PaymentFooter";

import {
  invoiceTypes,
  invoiceActions,
  invoiceSelectors,
} from "../../state/modules/invoice";

import {
  paymentSelectors,
  paymentActions,
  paymentTypes,
} from "../../state/modules/payment";

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

const payByPayPal = (recordAction, invoice) => {
  return data => {
    return recordAction({
      payerId: invoice.payer.id,
      payPalOrderId: data.orderID,
      invoiceId: invoice.invoiceId,
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
          <Text mb={2}>Fetching invoice&hellip;</Text>
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
              invoice={invoice}
              methods={paymentMethods}
              status={invoice.status}
              error={paymentError}
              payByCardSubmit={payByCard}
              payByPayPalSubmit={payByPayPal(recordPayPalPayment, invoice)}
              loading={paymentLoading}
            />
          </FormsContainer>

          <Details invoice={invoice} mt={-44} />
        </Root>
        <PaymentFooter></PaymentFooter>
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
  getMethodsError: paymentSelectors.paymentMethodsError(state),
  getMethodsLoading: paymentSelectors.paymentMethodsLoading(state),
  paymentMethods: paymentSelectors.getPaymentMethods(state),
  paymentError: paymentSelectors.recordPaymentError(state),
  paymentLoading: paymentSelectors.recordPaymentLoading(state),
});

export default connect(
  mapStateToProps,
  {
    recordPayPalPayment: paymentActions.recordPayPalPayment.request,
    getPaymentMethods: paymentActions.getPaymentMethods.request,
    payWithCard: paymentActions.recordCardPayment.request,
    updatePayer: invoiceActions.updatePayerAsync.request,
    getInvoice: invoiceActions.getInvoice.request,
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
