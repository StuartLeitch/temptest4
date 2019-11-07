import React from "react";

import { Separator, Title } from "@hindawi/react-components";

import { ChargeItem } from "../ChargeItem";
import { Charges as Root } from "./Charges.styles";

interface Props {}

const charges = {
  items: [
    { name: "Article Processing Charges", price: "$1,250.00" },
    { name: "Article Processing Charges2", price: "$1,250.00" },
    {
      name: "Article Processing Charges Article Processing Charges Article Processing Charges",
      price: "$1,250.00",
    },
  ],
};

const Charges: React.FC<Props> = props => (
  <Root>
    <div>
      <Separator direction="horizontal"></Separator>
    </div>
    <Title type="small">Charges</Title>
    {charges.items.map(({ name, price }, index) => (
      <ChargeItem name={name} price={price} key={index}></ChargeItem>
    ))}
  </Root>
);

export default Charges;
