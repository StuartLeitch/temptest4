import React, { useEffect, useContext } from 'react';

import {
  CouponEditContext,
  CouponCreateContext,
  MultipleCouponCreateContext,
} from '../../Context';

import { CouponMode } from '../../types';

import { CREATE, CREATE_MULTIPLE, EDIT, VIEW } from '../../config';

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
  function chosenContext(mode) {
    if (mode === CREATE) {
      const { couponState, update } = useContext(CouponCreateContext);
      return { couponState, update };
    } else if (mode === CREATE_MULTIPLE) {
      const { multipleCouponState, update } = useContext(
        MultipleCouponCreateContext
      );
      return { multipleCouponState, update };
    } else {
      const { couponState, update } = useContext(CouponEditContext);
      return { couponState, update };
    }
  }

  const chosenContextType = chosenContext(mode);

  const { couponState, multipleCouponState } = chosenContextType;

  useEffect(() => {
    chosenContextType.update(id, { value, isValid: true });
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
              checked={
                mode === CREATE_MULTIPLE
                  ? option.id === multipleCouponState[id].value
                  : option.id === couponState[id].value
              }
              onChange={() =>
                chosenContextType.update(id, {
                  value: option.id,
                  isValid: true,
                })
              }
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
