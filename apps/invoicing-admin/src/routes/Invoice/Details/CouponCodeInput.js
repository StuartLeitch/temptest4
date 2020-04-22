import React, { useState } from 'react';
import { func } from 'prop-types';

import { FormGroup, Input, FormFeedback } from '../../../components';

const MAX_LENGTH = 10;

const CouponCodeInput = ({ validationCallback }) => {
  const [isTouched, setTouched] = useState(false);
  const [isValid, setValid] = useState(false);

  const validateInput = (value) => {
    const pattern = new RegExp('/^([A-Z0-9]{6,10})$/');

    if (!value.match(/^([A-Z0-9]{6,10})$/)) {
      setValid(false);
      validationCallback(false);
      return;
    }

    setValid(true);
    validationCallback(true);
  };

  const onChange = (e) => {
    if (!isTouched) setTouched(true);
    validateInput(e.target.value);
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
};

export default CouponCodeInput;
