import React from "react";
import { Formik } from "formik";
import styled from "styled-components";
import { Expander, th } from "@hindawi/react-components";

import Paypal from "./Paypal";
import ChoosePayment from "./ChoosePayment";
import CreditCardForm from "./CreditCardForm";

const PAYMENT_METHODS = {
  paypal: "paypal",
  creditCard: "creditCard",
};

interface Props {}

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

const InvoicePayment: React.FunctionComponent<Props> = () => {
  return (
    <Expander title="2. Invoice & Payment">
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
