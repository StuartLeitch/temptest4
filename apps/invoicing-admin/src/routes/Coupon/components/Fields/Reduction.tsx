import React, { useContext, useEffect, useState } from 'react';

import {
  CouponEditContext,
  CouponCreateContext,
  MultipleCouponCreateContext,
} from '../../Context';

import { CREATE, CREATE_MULTIPLE, EDIT, VIEW } from '../../config';

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

const Reduction: React.FC<ReductionProps> = ({
  value,
  disabled = false,
  helper = '',
  label = 'Reduction',
  mode,
}) => {
  const [isTouched, setTouched] = useState(false);
  function chosenContext(mode) {
    if (mode === CREATE) {
      const {
        couponState: { reduction },
        update,
      } = useContext(CouponCreateContext);
      return { reduction, update };
    } else if (mode === CREATE_MULTIPLE) {
      const {
        multipleCouponState: { reduction },
        update,
      } = useContext(MultipleCouponCreateContext);
      return { reduction, update };
    } else {
      const {
        couponState: { reduction },
        update,
      } = useContext(CouponEditContext);
      return { reduction, update };
    }
  }

  const chosenContextReduction = chosenContext(mode);

  useEffect(() => {
    if ([EDIT, VIEW].includes(mode)) {
      chosenContextReduction.update('reduction', { value, isValid: true });
    }
  }, []);

  const onChange = (e) => {
    if (!isTouched) setTouched(true);

    const inputValue = e.target.value;
    const validation = /^(100|([1-9][0-9]?(\.[0-9]{1,2})?))$/; // 0 - 100, two decimals

    const isValid = validation.test(inputValue);

    chosenContextReduction.update('reduction', { value: inputValue, isValid });
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
            value={chosenContextReduction.reduction.value}
            id='reduction'
            onChange={onChange}
            valid={isTouched && chosenContextReduction.reduction.isValid}
            invalid={isTouched && !chosenContextReduction.reduction.isValid}
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
