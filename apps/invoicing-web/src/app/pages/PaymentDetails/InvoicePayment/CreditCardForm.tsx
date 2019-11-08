import React from "react";
import styled from "styled-components";
import {
  Button,
  Expander,
  Label,
  Flex,
  FormField,
  th,
} from "@hindawi/react-components";

interface Props {
  handleSubmit: any;
}

const CreditCardForm: React.FunctionComponent<Props> = ({ handleSubmit }) => (
  <Flex vertical>
    <Label>Credit Card Details</Label>
    <CardContainer mt={2}>
      <FormField required label="Card Number" name="cardNumber" mr={4} />
      <FormField required label="Expiration Date" name="expiration" mr={4} />
      <FormField required label="CVV" name="cvv" mr={4} />
      <FormField label="Postal Code" name="postalCode" mr={4} />
      <Button mb={2} size="medium" onClick={handleSubmit}>
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
