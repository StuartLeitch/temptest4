import React, { Fragment } from "react";
import { LayoutProps, SpaceProps, FlexProps } from "styled-system";

import { Flex, Label, Text } from "@hindawi/react-components";

interface Props extends LayoutProps, SpaceProps, FlexProps {
  vat: any;
  price: number;
  rate?: number;
}

const VatCharge: React.FC<Props> = ({ vat, price, rate, ...rest }) => {
  const vatAmount = (price * vat) / 100;
  const amountInPounds = vatAmount / rate;
  return (
    <Fragment>
      <Flex justifyContent="space-between" mt={2}>
        <Flex justifyContent="flex-start">
          <Label>VAT</Label>
          <Text>(+{vat}%)</Text>
        </Flex>
        <Text>${vatAmount.toFixed(2)}</Text>
      </Flex>

      <Flex justifyContent="flex-start">
        <Text type="secondary">
          {`(VAT amount in GBP is ${amountInPounds.toFixed(
            2,
          )}GBP, 1 GBP = ${rate}USD)`}
        </Text>
      </Flex>
    </Fragment>
  );
};

VatCharge.defaultProps = {
  rate: 1.2,
};

export default VatCharge;
