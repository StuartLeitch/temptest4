import React, { Fragment } from "react";
import { LayoutProps, SpaceProps, FlexProps } from "styled-system";
import Tooltip from "antd/lib/tooltip";
import { InfoCircleOutlined } from "@ant-design/icons";

import { Flex, Label, Text } from "@hindawi/react-components";
import { FormatUtils } from "@hindawi/invoicing-web/app/utils/format";

interface Props extends LayoutProps, SpaceProps, FlexProps {
  vat: any;
  price: number;
  rate?: number;
  tenant?: string;
}

const vatInfoText = {
  Hindawi: `
  VAT charges will be applied for individuals resident in the UK and for institutions registered in the UK. VAT is calculated at the applicable rate, currently 20%, on the net USD amount and this VAT charge will be available for review on the invoice prior to confirmation.
`,
  GeoScienceWorld: `
The service recipient is liable to pay the entire amount of any Sales, VAT or GST tax.

This invoice amount is net of any service tax.

Any such taxes has to be borne by the customer and paid directly to the appropriate tax authorities.

GeoScienceWorld is a not for profit organization and does not allow deductions of any taxes from its invoice amount.`,
};

const VatCharge: React.FC<Props> = ({ tenant, vat, price, ...rest }) => {
  const vatAmount = (price * vat) / 100;
  return (
    <Fragment>
      <Flex justifyContent="space-between" mt={2}>
        <Flex justifyContent="flex-start" style={{ width: "80%" }}>
          <Label>VAT</Label>
          <Text>(+{vat}%)</Text>
          <Tooltip
            placement="top"
            title={vatInfoText[tenant]}
            overlayStyle={{
              fontFamily: "Nunito,sans-serif",
              fontWeight: "normal",
              fontStyle: "normal",
              lineHeight: 1.3,
              fontSize: "14px",
            }}
          >
            <InfoCircleOutlined style={{ color: "#333" }} />
          </Tooltip>
        </Flex>
        <Text>${FormatUtils.formatPrice(vatAmount)}</Text>
      </Flex>
    </Fragment>
  );
};

VatCharge.defaultProps = {
  tenant: "Hindawi",
};

export default VatCharge;
