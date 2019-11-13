import React from "react";
import { Formik } from "formik";
import styled from "styled-components";
import {
  Expander,
  Label,
  ActionLink,
  Icon,
  th,
} from "@hindawi/react-components";

import Paypal from "./Paypal";
import BankTransfer from "./BankTransfer";
import ChoosePayment from "./ChoosePayment";
import CreditCardForm from "./CreditCardForm";

const PAYMENT_METHODS = {
  paypal: "paypal",
  creditCard: "creditCard",
  bankTransfer: "bankTransfer",
};

interface Props {
  payerId: string;
}

const validateFn = values => {
  if (values.paymentMethod === PAYMENT_METHODS.paypal) return {};

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

  return errors;
};

const InvoicePayment: React.FunctionComponent<Props> = ({ payerId }) => {
  return (
    <Expander title="2. Invoice & Payment">
      <Label my="4" ml="4">
        Your Invoice
        <ActionLink type="action" ml="4" link={`./api/invoice/${payerId}`}>
          <Icon name="download" color="colors.actionSecondary" mr="1" />
          Download
        </ActionLink>
      </Label>
      <Formik
        validate={validateFn}
        initialValues={{ paymentMethod: null }}
        onSubmit={values => console.log("the values")}
      >
        {({ handleSubmit, setFieldValue, values }) => {
          return (
            <Root>
              <ChoosePayment setFieldValue={setFieldValue} values={values} />
              {values.paymentMethod === PAYMENT_METHODS.creditCard && (
                <CreditCardForm handleSubmit={handleSubmit} />
              )}
              {values.paymentMethod === PAYMENT_METHODS.bankTransfer && (
                <BankTransfer />
              )}
              {values.paymentMethod === PAYMENT_METHODS.paypal && (
                <Paypal onSuccess={p => console.log("pe success", p)} />
              )}
            </Root>
          );
        }}
      </Formik>
    </Expander>
  );
};

export default InvoicePayment;

// #region styles
const Root = styled.div`
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  padding: calc(${th("gridUnit")} * 4);
  width: 100%;
`;
// #endregion
