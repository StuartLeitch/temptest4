import React, { useEffect, useContext } from 'react';

import { CouponEditContext, CouponCreateContext } from '../../Context';

import { CouponMode } from '../../types';

import { CREATE } from '../../config';

import {
  FormGroup,
  Label,
  Col,
  CustomInput,
  FormText,
  InputGroup,
} from '../../../../components';

const TypeSelection: React.FC<TypeSelectionProps> = ({
  value,
  label,
  name,
  types,
  disabled = false,
  helper = '',
  id,
  mode,
}) => {
  const chosenContext =
    mode === CREATE ? CouponCreateContext : CouponEditContext;
  const { couponState, update } = useContext(chosenContext);

  useEffect(() => {
    update(id, { value, isValid: true });
  }, []);

  return (
    <FormGroup row>
      <Label className='font-weight-bold' for={types[0].label} sm={3}>
        {label}
      </Label>

      <Col sm={9} id={name}>
        <InputGroup className='d-flex align-items-center form-control bg-white border-0'>
          {types.map((option) => (
            <CustomInput
              key={option.id}
              disabled={disabled}
              type='radio'
              id={option.id}
              name={name}
              label={option.label}
              inline
              checked={option.id === couponState[id].value}
              onChange={() => update(id, { value: option.id, isValid: true })}
            />
          ))}
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

interface Type {
  id: string;
  label: string;
}

interface TypeSelectionProps {
  label: string;
  name: string;
  value?: string;
  types: Type[];
  disabled?: boolean;
  helper?: string;
  id?: string;
  mode: CouponMode;
}

export default TypeSelection;
