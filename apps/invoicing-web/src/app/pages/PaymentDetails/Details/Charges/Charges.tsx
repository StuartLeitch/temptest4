import React from "react";

import { Separator, Title, Flex } from "@hindawi/react-components";

import { ChargeItemGroup } from "../ChargeItemGroup";
import { Charges as Root } from "./Charges.styles";
import { ChargeItem } from "../ChargeItem";

interface Props {}

const charges = {
  items: [{ name: "Article Processing Charges", price: "$1,250.00" }],
  netTotal: "$3,750.00",
  vat: {
    percent: "20",
    value: "$750.00",
  },
  total: "$4,500.00",
};

const Charges: React.FC<Props> = props => (
  <Root>
    <div>
      <Separator direction="horizontal" />
    </div>
    <Title type="small" mt="4">
      Charges
    </Title>
    <ChargeItemGroup items={charges.items} mt="4" />
    <Flex justifyContent="flex-end" mt="2">
      <Separator direction="horizontal" fraction={20} />
    </Flex>
    <ChargeItem price={charges.netTotal} name="Net Charges" mt="2" />
  </Root>
);

export default Charges;
