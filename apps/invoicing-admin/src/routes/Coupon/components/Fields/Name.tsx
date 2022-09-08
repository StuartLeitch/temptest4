import React, { useEffect, useContext } from 'react';

import {
  FormGroup,
  Input,
  Label,
  Col,
  FormText,
  InputGroup,
} from '../../../../components';

import {
  CouponEditContext,
  CouponCreateContext,
  MultipleCouponCreateContext,
} from '../../Context';

import { CREATE, CREATE_MULTIPLE, VIEW } from '../../config';

import { CouponMode } from '../../types';

const Name: React.FC<NameProps> = ({
  value = '',
  disabled = false,
  helper = '',
  mode,
}) => {
  function chosenContext(mode) {
    if (mode === CREATE) {
      const {
        couponState: { name },
        update,
      } = useContext(CouponCreateContext);
      return { name, update };
    } else if (mode === CREATE_MULTIPLE) {
      const {
        multipleCouponState: { name },
        update,
      } = useContext(MultipleCouponCreateContext);

      return { name, update };
    } else {
      const {
        couponState: { name },
        update,
      } = useContext(CouponEditContext);
      return { name, update };
    }
  }

  const chosenContextName = chosenContext(mode);

  useEffect(() => {
    chosenContextName.update('name', { value, isValid: true });
  }, []);

  return (
    <FormGroup row>
      <Label className='font-weight-bold' for='couponName' sm={3}>
        Description
      </Label>
      <Col sm={9}>
        <InputGroup>
          <Input
            type='textarea'
            value={chosenContextName.name.value}
            disabled={disabled}
            placeholder='Coupon description'
            id='couponName'
            onChange={(e) =>
              chosenContextName.update('name', {
                value: e.target.value,
                isValid: true,
              })
            }
            maxLength={255}
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
  mode: CouponMode;
}

export default Name;
