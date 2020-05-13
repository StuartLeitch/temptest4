import React from 'react';

interface Field {
  value: string;
  isValid?: boolean;
}

interface ContextProps {
  couponState?: {
    name: Field;
    reduction: Field;
    type: Field;
    status: Field;
    expirationDate: Field;
  };
  update?: Function;
}

export const CouponContext = React.createContext<ContextProps>({});

export const couponReducerInitialState = {
  name: { value: '', isValid: true },
  reduction: { value: '', isValid: true },
  type: { value: '', isValid: true },
  status: { value: '', isValid: true },
  expirationDate: { value: null, isValid: true },
};
