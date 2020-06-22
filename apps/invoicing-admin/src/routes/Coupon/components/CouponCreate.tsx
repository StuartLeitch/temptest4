import React from 'react';

import { Form } from '../../../components';
import { TypeSelection, CreateCode, Reduction, Name, Date } from './Fields';

import { couponTypeOptions, couponStatusOptions } from '../config';

import { CREATE } from '../config';

const CouponCreate: React.FC = () => {
  return (
    <Form>
      <Name mode={CREATE} />

      <TypeSelection
        label='Type'
        id='type'
        name='types'
        types={couponTypeOptions}
        mode={CREATE}
        value='SINGLE_USE'
      />

      <CreateCode label='Code *' />

      <Reduction label='Reduction *' mode={CREATE} />

      <TypeSelection
        label='Status'
        name='status'
        types={couponStatusOptions}
        id='status'
        mode={CREATE}
        value='ACTIVE'
      />

      <Date
        label='Expiration Date'
        id='expirationDate'
        filter={(date) => date > window.Date.now()}
        mode={CREATE}
      />
    </Form>
  );
};

export default CouponCreate;
