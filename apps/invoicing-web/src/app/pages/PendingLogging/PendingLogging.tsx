import React from "react";
import styled from "styled-components";
import { Flex, Text, Title, Loader, th } from "@hindawi/react-components";

export const PendingLogging = () => {
  return (
    <Root>
      <StyledModal>
        <Title mt={10}>Logging you in</Title>
        <Text mt={6}>This will take a moment, please wait&hellip;</Text>
        <Flex mt={5} mb={5}>
          <Loader size={10} />
        </Flex>
      </StyledModal>
    </Root>
  );
};

// #region styles
const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  width: 100%;
  height: 100vh;
`;

const StyledModal = styled.div`
  background-color: ${th("colors.background")};
  border-radius: ${th("gridUnit")};
  box-shadow: 0px 1px 10px rgba(36, 36, 36, 0.8);
  border-radius: 6px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 500px;
`;
// #endregion
