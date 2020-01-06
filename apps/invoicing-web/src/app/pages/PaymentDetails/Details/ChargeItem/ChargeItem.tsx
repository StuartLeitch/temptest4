import React from "react";
import { FlexboxProps, LayoutProps, SpaceProps } from "styled-system";

import { Label, Text } from "@hindawi/react-components";

import { ChargeItem as Root } from "./ChargeItem.styles";
import { FormatUtils } from "../../../../utils/format";

interface Props extends FlexboxProps, LayoutProps, SpaceProps {
  price: number;
  name: string;
  description?: string;
}

const ChargeItem: React.FC<Props> = ({ price, name, description, ...rest }) => (
  <Root {...rest}>
    <Label>
      {name}
      {description && <Text>({description})</Text>}
    </Label>
    <Text>${FormatUtils.formatPrice(price)}</Text>
  </Root>
);

export default ChargeItem;
