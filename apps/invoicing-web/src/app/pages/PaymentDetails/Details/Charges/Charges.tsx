import React from "react";
import { LayoutProps, SpaceProps } from "styled-system";

import { Separator, Title, Flex, Icon, Text } from "@hindawi/react-components";

import { ChargeItemGroup } from "../ChargeItemGroup";
import { Charges as Root } from "./Charges.styles";
import { TotalCharges } from "../TotalCharges";
import { ChargeItem } from "../ChargeItem";
import { VatCharge } from "../VatCharge";

interface Props extends LayoutProps, SpaceProps {
  charges: any;
}

const showWarning = (warning: string) => {
  if (warning) {
    return (
      <Flex justifyContents="center" alignItems="center" mt="2">
        <Icon name="warningFilled" color="colors.warning" mr="1"></Icon>
        <Text>{warning}</Text>
      </Flex>
    );
  }
};

const Charges: React.FC<Props> = ({ charges, ...rest }) => (
  <Root {...rest}>
    <Separator direction="horizontal" fraction="auto" mx={-4} />
    <Title type="small" mt="4">
      Charges
    </Title>
    <ChargeItemGroup items={charges.items} mt="4" />
    <Flex justifyContent="flex-end" mt="2">
      <Separator direction="horizontal" fraction={20} />
    </Flex>
    <ChargeItem price={charges.netTotal} name="Net Charges" mt="2" />
    <VatCharge vat={charges.vat} mt="2"></VatCharge>
    <Separator direction="horizontal" fraction="auto" mx={-2} mt={2} />
    <TotalCharges total={charges.total} mt="2"></TotalCharges>
    {showWarning(charges.warning)}
  </Root>
);

export default Charges;
