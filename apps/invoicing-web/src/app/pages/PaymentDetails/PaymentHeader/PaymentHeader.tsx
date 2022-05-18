import React from "react";
import styled from "styled-components";

import { Title, Flex, th } from "@hindawi/react-components";

interface Props {
  articleTitle: string;
}

const Root = styled.div`
  background-image: url("../../../../assets/images/swirly-background.webp");
  width: 100%;
  height: 200px;
  display: flex;
  padding: 0 calc(${th("gridUnit")} * 8);
`;

const PaymentHeader: React.FC<Props> = ({ articleTitle }) => (
  <Root>
    <Flex
      justifyContent="flex-start"
      alignItems="flex-start"
      flexDirection="column"
      flex="2"
      mt="15"
      mr="8"
    >
      <Title type="hero" color="dark">
        Define Payment Details
      </Title>
      <Title type="small" color="dark" mt="4">
        {articleTitle}
      </Title>
    </Flex>
    <Flex flex="1"></Flex>
  </Root>
);

export default PaymentHeader;
