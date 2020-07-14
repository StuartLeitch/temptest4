import React from 'react';

interface Field {
  value: string;
  isValid?: boolean;
}

interface ContextProps {
  couponState?: {
    name?: Field;
    reduction: Field;
    type: Field;
    status: Field;
    expirationDate: Field;
    code?: Field;
  };
  update?(field: string, {value: string, isValid: boolean}): void;
}

// EDIT
export const CouponEditContext = React.createContext<ContextProps>({});

export const couponEditInitialState = {
  name: { value: '', isValid: true },
  reduction: { value: '', isValid: true },
  type: { value: '', isValid: true },
  status: { value: '', isValid: true },
  expirationDate: { value: null, isValid: true },
};

// CREATE
export const CouponCreateContext = React.createContext<ContextProps>({});

export const couponCreateInitialState = {
  name: { value: '', isValid: true },
  reduction: { value: '', isValid: false },
  type: { value: '', isValid: true },
  status: { value: '', isValid: true },
  expirationDate: { value: null, isValid: true },
  code: { value: '', isValid: false },
};
