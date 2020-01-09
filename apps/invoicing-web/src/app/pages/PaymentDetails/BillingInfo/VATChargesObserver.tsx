import React, { useEffect } from "react";

interface Props {
  postalCode: string;
  country: string;
  state: string;
  paymentType: string;
  onChange(
    country: string,
    state: string,
    postalCode: string,
    paymentType: string,
  ): any;
}

const VatChargesObserver: React.FunctionComponent<Props> = ({
  postalCode,
  country,
  state,
  onChange,
  paymentType,
}) => {
  useEffect(() => {
    if (country && paymentType) {
      onChange(country, state, postalCode, paymentType);
    }
  }, [country, paymentType, state, postalCode]);

  return null;
};

export default VatChargesObserver;
