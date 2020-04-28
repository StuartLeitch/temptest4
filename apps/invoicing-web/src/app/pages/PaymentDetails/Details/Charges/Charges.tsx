import React from "react";
import { LayoutProps, SpaceProps } from "styled-system";

import { Separator, Title, Flex, Icon, Text } from "@hindawi/react-components";

import { Charges as Root } from "./Charges.styles";
import { TotalCharges } from "../TotalCharges";
import { ChargeItem } from "../ChargeItem";
import { VatCharge } from "../VatCharge";

import { config } from "../../../../../config";
import { FormatUtils } from "../../../../utils/format";

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

const Charges: React.FC<Props> = ({ invoiceItem, ...rest }: any) => {
  const { vat, rate, vatnote, price, coupons = [], waivers = [] } = invoiceItem;
  const reductions = [...coupons, ...waivers];
  let totalDiscountFromReductions = reductions.reduce(
    (acc, curr) => acc + curr.reduction,
    0,
  );
  totalDiscountFromReductions =
    totalDiscountFromReductions > 100 ? 100 : totalDiscountFromReductions;
  const finalPrice = price - (price * totalDiscountFromReductions) / 100; // net charges
  const vatNote = vatnote
    .replace(
      "{Vat/Rate}",
      `${FormatUtils.formatPrice(((vat / 100) * finalPrice) / rate)}`,
    )
    .replace("{Rate}", rate);

  let waiverItems;
  const totalDiscountFromWaivers = waivers.reduce(
    (acc, curr) => acc + curr.reduction,
    0,
  );
  if (waivers && waivers.length > 0) {
    waiverItems = invoiceItem.waivers.map(waiver => (
      <ChargeItem
        key={waiver.type_id}
        price={-(waiver.reduction * invoiceItem.price) / 100}
        name={"Waiver " + waiver.type_id}
        description={`${-waiver.reduction}%`}
        mt="2"
      />
    ));
    if (totalDiscountFromWaivers > 100) {
      waiverItems = [
        <ChargeItem
          key={"100%"}
          price={-invoiceItem.price}
          name={"Waivers: " + waivers.map(w => w.type_id).join(", ")}
          description={`-100%`}
          mt="2"
        />,
      ];
    }
  }

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
      {waiverItems}
      {invoiceItem.coupons &&
        invoiceItem.coupons.map(coupon => (
          <ChargeItem
            key={coupon.code}
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
        tenant={config.tenantName}
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
