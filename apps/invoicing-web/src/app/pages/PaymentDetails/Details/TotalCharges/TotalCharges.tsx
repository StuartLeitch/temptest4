import React from "react";
import { LayoutProps, SpaceProps, FlexProps } from "styled-system";

import { Flex, Title } from "@hindawi/react-components";
import { FormatUtils } from "@hindawi/invoicing-web/app/utils/format";

interface Props extends LayoutProps, SpaceProps, FlexProps {
  price: number;
  vat: number;
}

const TotalCharges: React.FC<Props> = ({ price, vat, ...rest }) => (
  <Flex justifyContent="space-between" {...rest}>
    <Title type="small">Total</Title>
    <Title type="small">
      ${FormatUtils.formatPrice(price + (price * vat) / 100)}
    </Title>
  </Flex>
);

export default TotalCharges;
