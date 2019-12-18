import React from "react";
import { LayoutProps, SpaceProps } from "styled-system";

import { Separator, Title, Flex, Icon, Text } from "@hindawi/react-components";

import { Charges as Root } from "./Charges.styles";
import { TotalCharges } from "../TotalCharges";
import { ChargeItem } from "../ChargeItem";
import { VatCharge } from "../VatCharge";

interface Props extends LayoutProps, SpaceProps {
  invoiceItem: any;
}

const showInfo = (info: string) => {
  if (info) {
    return (
      <Flex justifyContent="flex-end" mt="4">
        <Icon name="warningFilled" color="colors.info" mr="2"></Icon>
        <Text>{info}</Text>
      </Flex>
    );
  }
};

const Charges: React.FC<Props> = ({ invoiceItem, ...rest }) => {
  const { vat, rate, vatnote, price, coupons } = invoiceItem;
  let totalDiscountFromCoupons = coupons.reduce(
    (acc, curr) => acc + curr.reduction,
    0,
  );
  totalDiscountFromCoupons =
    totalDiscountFromCoupons > 100 ? 100 : totalDiscountFromCoupons;
  const finalPrice = price - (price * totalDiscountFromCoupons) / 100;
  const vatNote = vatnote
    .replace("{Vat/Rate}", `${(((vat / 100) * finalPrice) / rate).toFixed(2)}`)
    .replace("{Rate}", rate);

  return (
    <Root {...rest}>
      <Separator direction="horizontal" fraction="auto" mx={-4} />
      <Title type="small" mt="4">
        Charges
      </Title>
      <ChargeItem
        mt="4"
        price={invoiceItem.price}
        name="Article Processing Charges"
      />
      {invoiceItem.coupons &&
        invoiceItem.coupons.map(coupon => (
          <ChargeItem
            price={-(coupon.reduction * invoiceItem.price) / 100}
            name="Coupon"
            description={`${-coupon.reduction}%`}
            mt="2"
          />
        ))}
      <Flex justifyContent="flex-end" mt="2">
        <Separator direction="horizontal" fraction={20} />
      </Flex>
      <ChargeItem price={finalPrice} name="Net Charges" mt="2" />
      <VatCharge
        vat={invoiceItem.vat}
        price={finalPrice}
        rate={invoiceItem.rate}
      />
      <Separator direction="horizontal" fraction="auto" mx={-2} mt={2} />
      <TotalCharges price={finalPrice} vat={invoiceItem.vat} mt="2" />
      {vatNote !== " " ? showInfo(vatNote) : null}
    </Root>
  );
};

export default Charges;
