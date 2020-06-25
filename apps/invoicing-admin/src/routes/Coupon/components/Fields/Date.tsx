import React, { useContext, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { noop } from 'lodash';

import { CouponEditContext, CouponCreateContext } from '../../Context';

import { Button, Label, Col, FormGroup } from '../../../../components';

import { CouponMode } from '../../types';

import { CREATE, VIEW } from '../../config';
const Date: React.FC<DateProps> = ({
  stringValue = '',
  label,
  disabled = false,
  id,
  filter = noop(),
  mode,
}) => {
  const chosenContext =
    mode === CREATE ? CouponCreateContext : CouponEditContext;
  const { couponState, update } = useContext(chosenContext);

  useEffect(() => {
    if (mode !== CREATE) {
      update(id, {
        value: stringValue ? new window.Date(stringValue).toISOString() : null,
        isValid: true,
      });
    }
  }, []);

  const onChange = (newDate) => {
    update(id, { value: newDate.toISOString(), isValid: true });
  };

  const hasValue = stringValue && couponState[id];
  const isViewModeOn = mode === VIEW;
  const canBeEdited = !isViewModeOn && !disabled;

  return (
    <FormGroup row>
      <Label className='font-weight-bold' for='couponName' sm={3}>
        {label}
      </Label>
      <Col sm={9} className='d-flex align-items-center'>
        {(hasValue || canBeEdited) && (
          <DatePicker
            disabled={disabled}
            customInput={<Pick />}
            selected={
              couponState[id].value === null
                ? null
                : new window.Date(couponState[id].value)
            }
            onChange={onChange}
            filterDate={filter}
          />
        )}
      </Col>
    </FormGroup>
  );
};

const Pick = ({ value = '', onClick = noop() }: PickProps) => {
  return (
    <Button outline onClick={onClick}>
      <i className='fas fa-fw fa-calendar mr-1' />
      {value}
    </Button>
  );
};

interface PickProps {
  value?: string;
  disabled?: boolean;
  onClick?: void;
}

interface DateProps {
  label: string;
  disabled?: boolean;
  stringValue?: string;
  id?: string;
  filter?: (date: number) => boolean | void;
  mode: CouponMode;
}

export default Date;
