import React, { useState } from 'react';

import {
  FormGroup,
  Input,
  FormFeedback,
  Label,
  Col,
} from '../../../../components';

const MAX_LENGTH = 10;
const CODE_PATTERN = /^([A-Z0-9]{6,10})$/;

const Code = ({
  validationCallback,
  onChangeCallback,
  withLabel = false,
  disabled = false,
  value = '',
}: CodeProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isTouched, setTouched] = useState(false);
  const [isValid, setValid] = useState(false);

  const validateInput = (newValue) => {
    if (!newValue.match(CODE_PATTERN)) {
      setValid(false);
      if (validationCallback) validationCallback(false);
      return;
    }

    setValid(true);
    if (validationCallback) validationCallback(true);
  };

  const onChange = (e) => {
    if (!isTouched) setTouched(true);

    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);

    validateInput(newValue);
    if (onChangeCallback) onChangeCallback(newValue);
  };

  return (
    <FormGroup row>
      {withLabel && (
        <Label className='font-weight-bold' for='couponTypes' sm={3}>
          Code
        </Label>
      )}

      <Col sm={withLabel ? 9 : 12}>
        <Input
          disabled={disabled}
          value={inputValue}
          type='text'
          name='couponCodeInput'
          id='couponCodeInput'
          placeholder='Coupon code'
          onChange={onChange}
          maxLength={MAX_LENGTH}
          valid={isTouched && isValid}
          invalid={isTouched && !isValid}
        />

        <FormFeedback className='ml-2 mt-2' invalid='true'>
          Code length must be between 6 and 10 characters, including only
          uppercase letters and numbers
        </FormFeedback>
      </Col>
    </FormGroup>
  );
};

interface CodeProps {
  value?: string;
  validationCallback?: Function;
  onChangeCallback?: Function;
  withLabel?: boolean;
  disabled?: boolean;
}

export default Code;
