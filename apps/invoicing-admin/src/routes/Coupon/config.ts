import { CouponMode } from './types';

export const helpers = {
  name: 'Accepts a maximum of 255 characters.',
  type: 'Type cannot be edited if coupon has been redeemed at least once.',
  reduction:
    'Reduction cannot be edited if coupon has been redeemed at least once.',
};

export const couponTypeOptions = [
  { id: 'SINGLE_USE', label: 'SINGLE USE' },
  { id: 'MULTIPLE_USE', label: 'MULTIPLE USE' },
];

export const couponStatusOptions = [
  { id: 'ACTIVE', label: 'ACTIVE' },
  { id: 'INACTIVE', label: 'INACTIVE' },
];

export const VIEW: CouponMode = 'VIEW';
export const EDIT: CouponMode = 'EDIT';
export const CREATE: CouponMode = 'CREATE';
export const CREATE_MULTIPLE: CouponMode = 'CREATE_MULTIPLE';
