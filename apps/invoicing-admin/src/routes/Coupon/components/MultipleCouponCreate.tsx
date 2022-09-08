import React from 'react';

import { Form, Label, CardText, Col, Row } from '../../../components';
import { TypeSelection, Reduction, Name, DateField, FileInput } from './Fields';

import { couponStatusOptions, couponTypeOptions } from '../config';

import { CREATE_MULTIPLE } from '../config';

const MultipleCouponCreate: React.FC = () => {
  return (
    <Form>
      <Name mode={CREATE_MULTIPLE} />

      <Reduction label='Reduction *' mode={CREATE_MULTIPLE} />

      <Row>
        <Label
          style={{ marginTop: '15px', marginBottom: '10px' }}
          className='font-weight-bold'
          sm={3}
        >
          Type
        </Label>
        <Col sm={9}>
          <CardText style={{ marginTop: '20px', marginBottom: '20px' }}>
            {couponTypeOptions[0].label}{' '}
          </CardText>
        </Col>
      </Row>

      <TypeSelection
        label='Status'
        name='status'
        types={couponStatusOptions}
        id='status'
        mode={CREATE_MULTIPLE}
        value='ACTIVE'
      />

      <DateField
        label='Expiration Date *'
        id='expirationDate'
        filter={(date) => date > window.Date.now()}
        mode={CREATE_MULTIPLE}
      />

      <FileInput />
    </Form>
  );
};

export default MultipleCouponCreate;
