import React from "react";
import styled from "styled-components";
import { Label, Flex, th } from "@hindawi/react-components";

import IconRadioButton from "../BillingInfo/IconRadioButton";
import { PaymentMethod } from "@hindawi/invoicing-web/app/state/modules/payment/types";

interface Props {
  values?: any;
  setFieldValue?: any;
  methods: PaymentMethod[];
}

const icons = {
  Paypal: "paypal",
  "Credit Card": "creditCard",
  "Bank Transfer": "bankTransfer",
};

const ChoosePayment: React.FunctionComponent<Props> = ({
  values,
  methods,
  setFieldValue,
}) => {
  return (
    <Root>
      <Label required>Choose Payment Method</Label>
      <Flex mt={2} mb={4}>
        {methods.map(m => (
          <IconRadioButton
            mr={1}
            key={m.id}
            label={m.name}
            icon={icons[m.name]}
            isSelected={values.paymentMethodId === m.id}
            onClick={() => setFieldValue("paymentMethodId", m.id)}
          />
        ))}
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
