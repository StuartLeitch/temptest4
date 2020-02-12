import React from "react";
import styled from "styled-components";
import { Flex, Text, Title, Loader, th } from "@hindawi/react-components";

export function NotFound() {
  return (
    <Root>
      <StyledModal>
        <Title mt={10}>
          <strong>404</strong>
        </Title>
        <Text mt={6} mb={12}>
          Sorry&hellip; There's nothing to see here.
        </Text>
      </StyledModal>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  width: 100%;
  height: 60vh;
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
