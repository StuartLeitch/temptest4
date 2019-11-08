import React from "react";
import { LayoutProps, SpaceProps, FlexProps } from "styled-system";

import { Label, Text } from "@hindawi/react-components";

import { VatCharge as Root } from "./VatCharge.styles";

interface Props extends LayoutProps, SpaceProps, FlexProps {
  vat: any;
}

const VatCharge: React.FC<Props> = ({ vat, ...rest }) => (
  <Root {...rest}>
    <div>
      <Label>VAT</Label>
      <Text>(+{vat.percent}%)</Text>
      <div>
        <Text>({vat.details})</Text>
      </div>
    </div>
    <Text>{vat.value}</Text>
  </Root>
);

export default VatCharge;
