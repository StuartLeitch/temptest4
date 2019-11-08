import React from "react";
import styled from "styled-components";
import { Label, Flex, th } from "@hindawi/react-components";

import IconRadioButton from "../BillingInfo/IconRadioButton";

interface Props {
  values?: any;
  setFieldValue?: any;
}

const PAYMENT_METHODS = {
  paypal: "paypal",
  creditCard: "creditCard",
};

const ChoosePayment: React.FunctionComponent<Props> = ({
  values,
  setFieldValue,
}) => {
  return (
    <Root>
      <Label required>Choose Payment Method</Label>
      <Flex mt={2} mb={4}>
        <IconRadioButton
          isSelected={values.paymentMethod === PAYMENT_METHODS.creditCard}
          onClick={() =>
            setFieldValue("paymentMethod", PAYMENT_METHODS.creditCard)
          }
          icon="creditCard"
          label="Credit Card"
          mr={1}
        />
        <IconRadioButton
          isSelected={values.paymentMethod === PAYMENT_METHODS.paypal}
          onClick={() => setFieldValue("paymentMethod", PAYMENT_METHODS.paypal)}
          icon="paypal"
          label="PayPal"
          ml={1}
        />
      </Flex>
    </Root>
  );
};

export default ChoosePayment;

// #region styles
const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
// #endregion
