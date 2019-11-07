import React from "react";

import { Label, Text } from "@hindawi/react-components";

import { ChargeItem as Root } from "./ChargeItem.styles";

interface Props {
  price: string;
  name: string;
}

const ChargeItem: React.FC<Props> = ({ price, name }) => (
  <Root>
    <Label>{name}</Label>
    <Text>{price}</Text>
  </Root>
);

export default ChargeItem;
