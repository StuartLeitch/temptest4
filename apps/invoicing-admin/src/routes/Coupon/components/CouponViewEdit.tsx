import React from 'react';

import { Form } from '../../../components';
import  { formatDate } from '../../../utils/date';
import { TypeSelection, Code, Reduction, Name, DateField, Redeems } from './Fields';

import { CouponType, CouponMode } from '../types';

import {
  helpers,
  couponTypeOptions,
  couponStatusOptions,
  VIEW,
} from '../config';

const CouponViewEdit: React.FC<CouponViewEditProps> = ({ coupon, mode }) => {
  const areInputsDisabled = mode === VIEW;
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
        mode={mode}
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
        mode={mode}
      />

      <Code label='Code' value={code} disabled />

      <Reduction
        value={reduction}
        disabled={areInputsDisabled || redeemCount > 0}
        {...(!areInputsDisabled && { helper: helpers['reduction'] })}
        mode={mode}
      />
      <TypeSelection
        value={status}
        disabled={areInputsDisabled}
        label='Status'
        name='status'
        types={couponStatusOptions}
        id='status'
        mode={mode}
      />

      <Redeems value={redeemCount} />

      <DateField
        stringValue={formatDate(Date.parse(dateCreated))}
        disabled
        label='Created Date'
        id='createdDate'
        mode={mode}
      />

      <DateField
        stringValue={formatDate(Date.parse(dateUpdated))}
        disabled
        label='Updated Date'
        id='updatedDate'
        mode={mode}
      />

      <DateField
        stringValue={formatDate(Date.parse(expirationDate))}
        disabled={areInputsDisabled}
        label='Expiration Date'
        id='expirationDate'
        filter={(date) => date > window.Date.now()}
        mode={mode}
      />
    </Form>
  );
};

interface CouponViewEditProps {
  coupon?: CouponType;
  mode: CouponMode;
}

export default CouponViewEdit;
