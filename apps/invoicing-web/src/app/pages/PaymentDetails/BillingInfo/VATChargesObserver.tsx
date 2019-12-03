import React, { useEffect } from "react";

interface Props {
  country: string;
  paymentType: string;
  onChange(country: string, paymentType: string): any;
}

const VatChargesObserver: React.FunctionComponent<Props> = ({
  country,
  onChange,
  paymentType,
}) => {
  useEffect(() => {
    if (country && paymentType) {
      onChange(country, paymentType);
    }
  }, [country, paymentType]);

  return null;
};

export default VatChargesObserver;
