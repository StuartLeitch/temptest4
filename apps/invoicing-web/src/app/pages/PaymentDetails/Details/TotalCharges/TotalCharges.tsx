import React from "react";
import { LayoutProps, SpaceProps, FlexProps } from "styled-system";

import { Flex, Title } from "@hindawi/react-components";

interface Props extends LayoutProps, SpaceProps, FlexProps {
  price: number;
  vat: number;
}

const TotalCharges: React.FC<Props> = ({ price, vat, ...rest }) => (
  <Flex justifyContent="space-between" {...rest}>
    <Title type="small">Total</Title>
    <Title type="small">${(price + (price * vat) / 100).toFixed(2)}</Title>
  </Flex>
);

export default TotalCharges;
