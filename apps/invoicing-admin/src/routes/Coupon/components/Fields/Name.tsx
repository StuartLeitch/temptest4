import React, { useEffect, useContext } from 'react';

import {
  FormGroup,
  Input,
  Label,
  Col,
  FormText,
  InputGroup,
} from '../../../../components';

import { CouponContext } from '../../Context';

const Name = ({ value = '', disabled = false, helper = '' }: NameProps) => {
  const {
    couponState: { name },
    update,
  } = useContext(CouponContext);

  useEffect(() => {
    update('name', { value, isValid: true });
  }, []);

  return (
    <FormGroup row>
      <Label className='font-weight-bold' for='couponName' sm={3}>
        Description
      </Label>
      <Col sm={9}>
        <InputGroup>
          <Input
            value={name.value}
            disabled={disabled}
            placeholder='Coupon name'
            id='couponName'
            onChange={(e) =>
              update('name', { value: e.target.value, isValid: true })
            }
            maxLength='255'
          />
        </InputGroup>

        {helper && (
          <FormText className='ml-1'>
            <i className='fas fa-info-circle mr-2'></i>
            {helper}
          </FormText>
        )}
      </Col>
    </FormGroup>
  );
};

interface NameProps {
  value?: string;
  disabled?: boolean;
  helper?: string;
}

export default Name;
