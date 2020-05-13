import React, { useContext, useEffect } from 'react';
import { CouponContext } from '../../Context';

import {
  FormGroup,
  Input,
  InputGroup,
  Label,
  Col,
  FormText,
  FormFeedback,
} from '../../../../components';

const Reduction = ({
  value,
  disabled = false,
  helper = '',
}: ReductionProps) => {
  const {
    couponState: { reduction },
    update,
  } = useContext(CouponContext);

  useEffect(() => {
    update('reduction', { value, isValid: true });
  }, []);

  const onChange = (e) => {
    const inputValue = e.target.value;
    const validation = /^(100|([1-9][0-9]?(\.[0-9])?))$/; // 0 - 100, two decimals

    const isValid = inputValue.match(validation);

    update('reduction', { value: inputValue, isValid });
  };

  return (
    <FormGroup row>
      <Label className='font-weight-bold' for='reduction' sm={3}>
        Reduction
      </Label>
      <Col sm={9}>
        <InputGroup>
          <Input
            disabled={disabled}
            placeholder='Reduction percentage'
            value={reduction.value}
            id='reduction'
            onChange={onChange}
            invalid={!reduction.isValid}
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
}

export default Reduction;
