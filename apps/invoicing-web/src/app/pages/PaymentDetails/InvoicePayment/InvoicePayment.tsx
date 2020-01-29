import React, { useMemo } from "react";
import { connect } from "react-redux";
import { RootState } from "typesafe-actions";
import { Formik } from "formik";
import styled from "styled-components";
import {
  Text,
  Label,
  Expander,
  ActionLink,
  Icon,
  th,
} from "@hindawi/react-components";

import { config } from "../../../../config";
import Paypal from "./Paypal";
import BankTransfer from "./BankTransfer";
import ChoosePayment from "./ChoosePayment";
import CreditCardForm from "./CreditCardForm";
import SuccessfulPayment from "./SuccessfulPayment";

import { invoiceSelectors, invoiceTypes } from "../../../state/modules/invoice";

const PAYMENT_METHODS = {
  paypal: "paypal",
  creditCard: "creditCard",
  bankTransfer: "bankTransfer",
};

interface Props {
  ccToken: string;
  invoice: any;
  error: string;
  invoiceCharge: number;
  invoiceIsPaid: boolean;
  loading: boolean;
  status: "DRAFT" | "ACTIVE" | "FINAL" | "PENDING";
  methods: Record<string, string>;
  payByCardSubmit: (data: any) => void;
  payByPayPalSubmit: (data: any) => void;
}

const validateFn = methods => values => {
  if (methods[values.paymentMethodId] === "Paypal") return {};

  const errors: any = {};

  if (!values.cardNumber) {
    errors.cardNumber = "Required";
  }
  if (!values.expiration) {
    errors.expiration = "Required";
  }
  if (!values.cvv) {
    errors.cvv = "Required";
  }
  if (!values.postalCode) {
    errors.postalCode = "Required";
  }

  return errors;
};

const calculateTotalToBePaid = (invoice: any) => {
  let netValue = invoice.invoiceItem.price;
  let { coupons } = invoice.invoiceItem;
  if (coupons && coupons.length) {
    let discount = invoice.invoiceItem.coupons.reduce(
      (acc, curr) => acc + curr.reduction,
      0,
    );
    discount = discount > 100 ? 100 : discount;
    netValue = netValue - (discount * netValue) / 100;
  }
  const vatPercent = invoice.invoiceItem.vat;
  const vat = (netValue * vatPercent) / 100;
  return netValue + vat;
};

const InvoiceDownloadLink = ({ payer }) => {
  if (payer) {
    return (
      <ActionLink
        type="action"
        ml="4"
        link={`${config.apiRoot}/invoice/${payer.id}`}
      >
        <Icon name="download" color="colors.actionSecondary" mr="1" />
        Download
      </ActionLink>
    );
  }

  return null;
};

const InvoicePayment: React.FunctionComponent<Props> = ({
  invoice,
  error,
  methods,
  loading,
  invoiceCharge,
  invoiceIsPaid,
  status,
  payByCardSubmit,
  payByPayPalSubmit,
  ccToken,
}) => {
  const parsedMethods = useMemo(
    () =>
      Object.entries(methods).map(([id, name]) => ({
        id,
        name,
        isActive: true,
      })),
    [methods],
  );

  return (
    <Expander
      title="2. Invoice &amp; Payment"
      expanded={
        status === "ACTIVE" || status === "FINAL" || "PENDING" ? true : false
      }
    >
      {invoiceIsPaid ? (
        <SuccessfulPayment
          onViewInvoice={() => {
            console.info(`./api/invoice/${invoice.payer.id}`);
          }}
          payerId={invoice.payer.id}
        />
      ) : status === "PENDING" ? (
        <Text my="4" ml="4">
          Your invoice is currently pending. You will be contacted soon by our
          invoicing team. Thank you for your understanding
        </Text>
      ) : (
        [
          <Label key={"invoice-download-link"} my="4" ml="4">
            Your Invoice
            <InvoiceDownloadLink payer={invoice.payer} />
          </Label>,
          <Formik
            key={"invoice-payment-form"}
            validate={validateFn(methods)}
            initialValues={{
              paymentMethodId: null,
              payerId: invoice && invoice.payer && invoice.payer.id,
              amount: invoiceCharge,
            }}
            onSubmit={payByCardSubmit}
          >
            {({ setFieldValue, values }) => {
              return (
                <Root>
                  <ChoosePayment
                    methods={parsedMethods}
                    setFieldValue={setFieldValue}
                    values={values}
                  />
                  {methods[values.paymentMethodId] === "Credit Card" && (
                    <CreditCardForm
                      ccToken={ccToken}
                      payerId={invoice && invoice.payer && invoice.payer.id}
                      paymentMethodId={values.paymentMethodId}
                      handleSubmit={payByCardSubmit}
                      total={calculateTotalToBePaid(invoice)}
                      loading={loading}
                    />
                  )}
                  {methods[values.paymentMethodId] === "Bank Transfer" && (
                    <BankTransfer />
                  )}
                  {methods[values.paymentMethodId] === "Paypal" && (
                    <Paypal
                      invoiceReferenceNumber={invoice.referenceNumber}
                      manuscriptCustomId={invoice.article.customId}
                      paymentMethodId={values.paymentMethodId}
                      onSuccess={payByPayPalSubmit}
                      total={calculateTotalToBePaid(invoice)}
                    />
                  )}
                  {error && <Text type="warning">{error}</Text>}
                </Root>
              );
            }}
          </Formik>,
        ]
      )}
    </Expander>
  );
};

const mapStateToProps = (state: RootState) => ({
  invoice: invoiceSelectors.invoice(state),
  invoiceError: invoiceSelectors.invoiceError(state),
  invoiceLoading: invoiceSelectors.invoiceLoading(state),
  invoiceCharge: invoiceSelectors.invoiceCharge(state),
  invoiceIsPaid: invoiceSelectors.invoiceIsPaid(state),
});

export default connect(mapStateToProps, {})(InvoicePayment);

// #region styles
const Root = styled.div`
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  padding: calc(${th("gridUnit")} * 4);
  width: 100%;
`;
// #endregion
