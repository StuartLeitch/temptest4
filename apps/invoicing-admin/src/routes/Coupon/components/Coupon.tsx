import React from 'react';

import { Form } from '../../../components';
import { TypeSelection, Code, Reduction, Name, Date, Redeems } from './Fields';

import { CouponType, CouponMode } from '../types';

import { helpers } from '../config';

const couponTypeOptions = [
  { id: 'SINGLE_USE', label: 'SINGLE USE' },
  { id: 'MULTIPLE_USE', label: 'MULTIPLE USE' },
];

const couponStatusOptions = [
  { id: 'ACTIVE', label: 'ACTIVE' },
  { id: 'INACTIVE', label: 'INACTIVE' },
];

const Coupon = ({ coupon, mode }: CouponProps) => {
  const areInputsDisabled = mode === 'VIEW';
  const {
    name,
    code,
    type,
    status,
    redeemCount,
    reduction,
    dateCreated,
    dateUpdated,
    expirationDate,
  } = coupon;

  return (
    <Form>
      <Name
        value={name}
        disabled={areInputsDisabled}
        {...(!areInputsDisabled && { helper: helpers['name'] })}
      />

      <TypeSelection
        value={type}
        disabled={areInputsDisabled || redeemCount > 0}
        label='Type'
        id='type'
        name='types'
        types={couponTypeOptions}
        {...(!areInputsDisabled && { helper: helpers['type'] })}
      />

      <Code value={code} disabled withLabel />

      <Reduction
        value={reduction}
        disabled={areInputsDisabled || redeemCount > 0}
        {...(!areInputsDisabled && { helper: helpers['reduction'] })}
      />
      <TypeSelection
        value={status}
        disabled={areInputsDisabled}
        label='Status'
        name='status'
        types={couponStatusOptions}
        id='status'
      />

      <Redeems value={redeemCount} />

      <Date
        stringValue={dateCreated}
        disabled
        label='Created Date'
        id='createdDate'
        mode={mode}
      />

      <Date
        stringValue={dateUpdated}
        disabled
        label='Updated Date'
        id='updatedDate'
        mode={mode}
      />

      <Date
        stringValue={expirationDate}
        disabled={areInputsDisabled}
        label='Expiration Date'
        id='expirationDate'
        filter={(date) => date > window.Date.now()}
        mode={mode}
      />
    </Form>
  );
};

interface CouponProps {
  coupon?: CouponType;
  mode: CouponMode;
}

export default Coupon;
