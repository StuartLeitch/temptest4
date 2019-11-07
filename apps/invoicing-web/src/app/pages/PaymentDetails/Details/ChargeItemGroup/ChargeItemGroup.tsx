import React from "react";
import { FlexboxProps, LayoutProps, SpaceProps } from "styled-system";

import { ChargeItemGroup as Root } from "./ChargeItemGroup.styles";

import ChargeItem from "../ChargeItem/ChargeItem";

interface Props extends FlexboxProps, LayoutProps, SpaceProps {
  items: any[];
}

const ChargeItemGroup: React.FC<Props> = ({ items, ...rest }) => (
  <Root {...rest}>
    {items.map(({ name, price }, index) => (
      <ChargeItem name={name} price={price} key={index}></ChargeItem>
    ))}
  </Root>
);

export default ChargeItemGroup;
