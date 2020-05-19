import React, { useContext, useEffect, useState } from 'react';

import { CouponEditContext, CouponCreateContext } from '../../Context';

import { CREATE } from '../../config';

import {
  FormGroup,
  Input,
  InputGroup,
  Label,
  Col,
  FormText,
  FormFeedback,
} from '../../../../components';

import { CouponMode } from '../../types';

const Reduction = ({
  value,
  disabled = false,
  helper = '',
  label = 'Reduction',
  mode,
}: ReductionProps) => {
  const [isTouched, setTouched] = useState(false);

  const chosenContext =
    mode === CREATE ? CouponCreateContext : CouponEditContext;
  const {
    couponState: { reduction },
    update,
  } = useContext(chosenContext);

  useEffect(() => {
    if (mode !== CREATE) {
      update('reduction', { value, isValid: true });
    }
  }, []);

  const onChange = (e) => {
    if (!isTouched) setTouched(true);

    const inputValue = e.target.value;
    const validation = /^(100|([1-9][0-9]?(\.[0-9]{1,2})?))$/; // 0 - 100, two decimals

    const isValid = validation.test(inputValue);

    update('reduction', { value: inputValue, isValid });
  };

  return (
    <FormGroup row>
      <Label className='font-weight-bold' for='reduction' sm={3}>
        {label}
      </Label>
      <Col sm={9}>
        <InputGroup>
          <Input
            className='rounded-right'
            disabled={disabled}
            placeholder='Reduction percentage'
            value={reduction.value}
            id='reduction'
            onChange={onChange}
            valid={isTouched && reduction.isValid}
            invalid={isTouched && !reduction.isValid}
          />

          <FormFeedback>
            Reduction should be a number between 1 - 100, accepting one to two
            decimals separated by "."
          </FormFeedback>
        </InputGroup>

        {helper && disabled && (
          <FormText color='danger' className='ml-1'>
            <i className='fas fa-info-circle mr-2'></i>
            {helper}
          </FormText>
        )}
      </Col>
    </FormGroup>
  );
};

interface ReductionProps {
  value?: number;
  disabled?: boolean;
  helper?: string;
  label?: string;
  mode: CouponMode;
}

export default Reduction;
