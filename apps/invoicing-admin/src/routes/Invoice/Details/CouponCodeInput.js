import React, { useState } from 'react';
import { func } from 'prop-types';

import { FormGroup, Input, FormFeedback } from '../../../components';

const MAX_LENGTH = 10;
const CODE_PATTERN = /^([A-Z0-9]{6,10})$/;

const CouponCodeInput = ({ validationCallback, onChangeCallback }) => {
  const [isTouched, setTouched] = useState(false);
  const [isValid, setValid] = useState(false);

  const validateInput = (value) => {
    if (!value.match(CODE_PATTERN)) {
      setValid(false);
      validationCallback(false);
      return;
    }

    setValid(true);
    validationCallback(true);
  };

  const onChange = (e) => {
    if (!isTouched) setTouched(true);

    const value = e.target.value;

    validateInput(value);
    onChangeCallback(value);
  };

  return (
    <FormGroup className='mb-2 mr-sm-2 mb-sm-0'>
      <Input
        type='text'
        name='couponCodeInput'
        id='couponCodeInput'
        placeholder='Coupon code'
        onChange={onChange}
        maxLength={MAX_LENGTH}
        valid={isTouched && isValid}
        invalid={isTouched && !isValid}
      />
      <FormFeedback className='ml-2 mt-2' invalid>
        Code length must be between 6 and 10 characters, including only
        uppercase letters and numbers
      </FormFeedback>
    </FormGroup>
  );
};

CouponCodeInput.propTypes = {
  validationCallback: func,
  onChangeCallback: func,
};

export default CouponCodeInput;
