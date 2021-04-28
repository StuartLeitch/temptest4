import React, { Fragment } from "react";
import styled from "styled-components";
import {
  Flex,
  Text,
  Title,
  Loader,
  Button,
  th,
} from "@hindawi/react-components";

interface Props {
  onAccept: any;
  onCancel: any;
  onRefresh: any;
  loading: boolean;
  error: string;
}

function buttons(error, onCancel, onAccept, onRefresh) {
  if(!error) {
    return (<Fragment>
            <Button type="outline" onClick={onCancel} mr={3}>
              CANCEL
            </Button>
            <Button type="primary" onClick={onAccept} ml={3}>
              YES, CONFIRM
            </Button>
          </Fragment>)
  } else {
    return (
      <Fragment>
        <Button type="primary" onClick={onRefresh} ml={3}>
              OK
            </Button>
      </Fragment>
    )
  }
}

const ConfirmationModal: React.FunctionComponent<Props> = ({
  loading,
  error,
  onAccept,
  onCancel,
  onRefresh
}: any) => {
  return (
    <Root>
      <Title mt={10}>Confirm Invoice?</Title>
      <Text mt={6}>Once confirmed, the payment details can't be modified.</Text>
      {error && (
        <Text padding={4} mt={4} type="warning">
          {error}
        </Text>
      )}

      <Flex mt={6} mb={10}>
        {loading ? (
          <Loader size={8} />
        ) : (buttons(error, onCancel, onAccept, onRefresh))}
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
