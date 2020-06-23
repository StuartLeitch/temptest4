import React, { useState, useEffect } from 'react';
import { useManualQuery } from 'graphql-hooks';

import {
  FormGroup,
  Input,
  FormFeedback,
  Label,
  Col,
  InputGroupAddon,
  InputGroup,
} from '../../../../components';

import { CouponMode } from '../../types';
import { CREATE } from '../../config';

import { GENERATE_COUPON_CODE_QUERY } from '../../graphql/queries';

const MAX_LENGTH = 10;
const CODE_PATTERN = /^([A-Z0-9]{6,10})$/;

const Code: React.FC<CodeProps> = ({
  onChangeCallback,
  label = '',
  disabled = false,
  value = '',
  mode,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isTouched, setTouched] = useState(false);
  const [isValid, setValid] = useState(false);
  const [isPrefillLoading, setIsPrefillLoading] = useState(false);

  const [generateCouponCode] = useManualQuery(GENERATE_COUPON_CODE_QUERY);

  const validateInput = (newValue) => {
    if (!newValue.match(CODE_PATTERN)) {
      setValid(false);
      return false;
    }

    setValid(true);
    return true;
  };

  const validateInputAndTriggerCallback = (newValue) => {
    const isInputValid = validateInput(newValue);
    if (onChangeCallback) onChangeCallback(newValue, isInputValid);
  };

  const onChange = (e) => {
    if (!isTouched) setTouched(true);

    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);

    validateInputAndTriggerCallback(newValue);
  };

  useEffect(() => {
    async function generateCode() {
      setIsPrefillLoading(true);

      const generateCouponCodeResponse = await generateCouponCode();
      const { code } = generateCouponCodeResponse.data.generateCouponCode;

      if (!generateCouponCodeResponse.error) {
        setInputValue(code);
        onChangeCallback(code, true);
      }

      setIsPrefillLoading(false);
    }

    if (mode && mode === CREATE) {
      generateCode();
    }
  }, []);

  return (
    <FormGroup row>
      {label && (
        <Label className='font-weight-bold' for='couponTypes' sm={3}>
          {label}
        </Label>
      )}

      <Col sm={label ? 9 : 12}>
        <InputGroup>
          <Input
            disabled={disabled || isPrefillLoading}
            value={inputValue}
            type='text'
            name='couponCodeInput'
            id='couponCodeInput'
            placeholder='Coupon code'
            onChange={onChange}
            maxLength={MAX_LENGTH}
            valid={isTouched && isValid}
            invalid={isTouched && !isValid}
            className={`${!isPrefillLoading ? 'rounded-right' : ''}`}
          />

          <FormFeedback className='ml-2 mt-2' invalid='true'>
            Code length must be between 6 and 10 characters, including only
            uppercase letters and numbers
          </FormFeedback>

          {isPrefillLoading && (
            <InputGroupAddon addonType='append'>
              <i className='fas fa-fw fa-spinner fa-spin'></i>
            </InputGroupAddon>
          )}
        </InputGroup>
      </Col>
    </FormGroup>
  );
};

interface CodeProps {
  value?: string;
  label?: string;
  disabled?: boolean;
  mode?: CouponMode;
  onChangeCallback?(value: string, isValid: boolean): void;
}

export default Code;
