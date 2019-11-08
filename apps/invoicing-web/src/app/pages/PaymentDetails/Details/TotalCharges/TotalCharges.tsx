import React from "react";
import { LayoutProps, SpaceProps, FlexProps } from "styled-system";

import { Title } from "@hindawi/react-components";

import { TotalCharges as Root } from "./TotalCharges.styles";

interface Props extends LayoutProps, SpaceProps, FlexProps {
  total: string;
}

const TotalCharges: React.FC<Props> = ({ total, ...rest }) => (
  <Root {...rest}>
    <Title type="small">Total</Title>
    <Title type="small">{total}</Title>
  </Root>
);

export default TotalCharges;
