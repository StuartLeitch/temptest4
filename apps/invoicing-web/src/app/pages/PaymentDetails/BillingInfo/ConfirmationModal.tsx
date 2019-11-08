import React from "react";
import styled from "styled-components";
import { Button, Flex, Title, Text, th } from "@hindawi/react-components";

interface Props {
  onAccept: any;
  onCancel: any;
}

const ConfirmationModal: React.FunctionComponent<Props> = ({
  onAccept,
  onCancel,
}) => {
  return (
    <Root>
      <Title mt={10}>Create Invoice?</Title>
      <Text mt={6}>Once created, the payment details can't be modified.</Text>
      <Flex mt={6} mb={10}>
        <Button type="outline" onClick={onCancel} mr={3}>
          CANCEL
        </Button>
        <Button type="primary" onClick={onAccept} ml={3}>
          YES, CREATE
        </Button>
      </Flex>
    </Root>
  );
};

export default ConfirmationModal;

// #region styles
const Root = styled.div`
  align-items: center;
  background-color: ${th("colors.background")};
  border-radius: ${th("gridUnit")};
  display: flex;
  flex-direction: column;
  justify-content: center;

  width: calc(${th("gridUnit")} * 110);
`;
// #endregion
