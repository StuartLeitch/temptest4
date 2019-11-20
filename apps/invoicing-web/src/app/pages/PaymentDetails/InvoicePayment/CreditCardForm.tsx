import React from "react";
import styled from "styled-components";
import { Flex, Label, Button, FormField, th } from "@hindawi/react-components";
import { Visa, MasterCard, Amex, Discover, JCB } from "./ValidCreditCards";

interface Props {
  handleSubmit: any;
  loading: boolean;
}

const CreditCardForm: React.FunctionComponent<Props> = ({
  loading,
  handleSubmit,
}) => (
  <Flex vertical>
    <Flex justifyContent="flex-start">
      <Label>Credit Card Details</Label>
      <Visa ml={1} />
      <MasterCard ml={1} />
      <Amex ml={1} />
      <JCB ml={1} />
      <Discover ml={1} />
    </Flex>

    <CardContainer mt={2}>
      <FormField required label="Card Number" name="cardNumber" mr={4} />
      <FormField required label="Expiration Date" name="expiration" mr={4} />
      <FormField required label="CVV" name="cvv" mr={4} />
      <FormField required label="Postal Code" name="postalCode" mr={4} />

      <Button mb={2} size="medium" onClick={handleSubmit} loading={loading}>
        Pay
      </Button>
    </CardContainer>
  </Flex>
);

export default CreditCardForm;

const CardContainer = styled(Flex)`
  background-color: ${th("colors.background")};
  border-radius: ${th("gridUnit")};
  padding: 0 calc(${th("gridUnit")} * 4);
  padding-top: calc(${th("gridUnit")} * 3);
`;
