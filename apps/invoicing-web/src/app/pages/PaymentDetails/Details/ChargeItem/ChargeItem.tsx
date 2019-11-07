import React from "react";
import { FlexboxProps, LayoutProps, SpaceProps } from "styled-system";

import { Label, Text } from "@hindawi/react-components";

import { ChargeItem as Root } from "./ChargeItem.styles";

interface Props extends FlexboxProps, LayoutProps, SpaceProps {
  price: string;
  name: string;
}

const ChargeItem: React.FC<Props> = ({ price, name, ...rest }) => (
  <Root {...rest}>
    <Label>{name}</Label>
    <Text>{price}</Text>
  </Root>
);

export default ChargeItem;
