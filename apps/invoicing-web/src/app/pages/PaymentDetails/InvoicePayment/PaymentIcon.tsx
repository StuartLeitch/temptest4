import React from "react";

interface Props {
  style?: object;
  className?: string;
  id: string;
  transparent?: boolean;
}

const PaymentIcon: React.FunctionComponent<Props> = ({
  style,
  className,
  id,
  transparent,
}) => (
  <img
    src={`/assets/payment-icons/${transparent ? "transparent/" : ""}${
      transparent ? id + "_transparent" : id
    }.svg`}
    style={style}
    className={className}
    alt={`${id} payment icon`}
  />
);

export default PaymentIcon;
