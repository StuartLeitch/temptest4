import React from "react";
import { Formik } from "formik";
import styled from "styled-components";
import {
  Button,
  Expander,
  Label,
  Flex,
  FormField,
  th,
} from "@hindawi/react-components";

import CreditCardForm from "./CreditCardForm";
import ChoosePayment from "./ChoosePayment";

const PAYMENT_METHODS = {
  paypal: "paypal",
  creditCard: "creditCard",
};

interface Props {}

const InvoicePayment: React.FunctionComponent<Props> = () => {
  return (
    <Expander title="2. Invoice & Payment">
      <Formik
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
