import React, { Fragment } from "react";
import { LayoutProps, SpaceProps, FlexProps } from "styled-system";
import Tooltip from "antd/lib/tooltip";
import Icon from "antd/lib/icon";

import { Flex, Label, Text } from "@hindawi/react-components";

interface Props extends LayoutProps, SpaceProps, FlexProps {
  vat: any;
  price: number;
  rate?: number;
}

const vatInfoText = `
Hindawi Limited is based in the United Kingdom and must charge a 20% Value Added Tax (VAT) on qualifying transactions.

UK VAT applies when we supply services to any individual or organization based in the UK.

When our customer is a non-VAT registered individual or organization based outside the UK but within the EU, Article 45 of 2006/112/EC applies. The place of supply is where the supplier, Hindawi Limited, is established and UK VAT therefore applies.

When our customer is a VAT-registered individual or organization based outside the UK but within the EU, Article 44 of the 2006/112/EC applies. The place of supply is where the customer is established, which puts the invoice outside the scope of UK VAT.

When our customer is an individual or organization based outside of the EU, all transactions are outside the scope of UK VAT.
`;

const VatCharge: React.FC<Props> = ({ vat, price, rate, ...rest }) => {
  const vatAmount = (price * vat) / 100;
  const amountInPounds = vatAmount / rate;
  return (
    <Fragment>
      <Flex justifyContent="space-between" mt={2}>
        <Flex justifyContent="flex-start">
          <Label>VAT</Label>
          <Text>(+{vat}%)</Text>
          <Tooltip
            placement="top"
            title={vatInfoText}
            overlayStyle={{
              fontFamily: "Nunito,sans-serif",
              fontWeight: "normal",
              fontStyle: "normal",
              lineHeight: 1.3,
              fontSize: "14px",
            }}
          >
            <Icon
              style={{ position: "relative", left: "5px" }}
              type="exclamation-circle"
            />
          </Tooltip>
        </Flex>
        <Text>${vatAmount.toFixed(2)}</Text>
      </Flex>
    </Fragment>
  );
};

VatCharge.defaultProps = {
  rate: 0,
};

export default VatCharge;
