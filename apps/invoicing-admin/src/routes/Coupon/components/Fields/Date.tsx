import React, { useContext, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { noop } from 'lodash';

import {
  CouponEditContext,
  CouponCreateContext,
  MultipleCouponCreateContext,
} from '../../Context';

import { Button, Label, Col, FormGroup } from '../../../../components';

import { CouponMode } from '../../types';

import { CREATE, CREATE_MULTIPLE, EDIT, VIEW } from '../../config';

const DateField: React.FC<DateProps> = ({
  stringValue = '',
  label,
  disabled = false,
  id,
  filter = noop(),
  mode,
}) => {
  function currentContext(mode) {
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

  const currentContextType = currentContext(mode);

  const { couponState, multipleCouponState } = currentContextType;

  useEffect(() => {
    if ([EDIT, VIEW].includes(mode)) {
      currentContextType.update(id, {
        value: stringValue ? convertLocalToUTCDate(stringValue) : null,
        isValid: true,
      });
    }
  }, []);

  const onChange = (newDate) => {
    currentContextType.update(id, {
      value: convertLocalToUTCDate(newDate),
      isValid: true,
    });
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
              mode === CREATE_MULTIPLE
                ? multipleCouponDate(multipleCouponState, id)
                : couponDate(couponState, id)
            }
            onChange={onChange}
            filterDate={filter}
          />
        )}
      </Col>
    </FormGroup>
  );
};

function convertUTCToLocalDate(date) {
  if (!date) {
    return date;
  }
  date = new window.Date(date);
  date = new window.Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return date;
}

function convertLocalToUTCDate(date) {
  if (!date) {
    return date;
  }
  date = new window.Date(date);
  date = new window.Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  return date.toDateString();
}

const Pick = ({ value = '', onClick = noop }: PickProps) => {
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
  onClick?: Function;
}

interface DateProps {
  label: string;
  disabled?: boolean;
  stringValue?: string;
  id?: string;
  filter?: (date: number) => boolean | void;
  mode: CouponMode;
}

export default DateField;

function couponDate(couponState, id: string) {
  return couponState[id].value === null
    ? null
    : new window.Date(couponState[id].value);
}

function multipleCouponDate(multipleCouponState, id: string) {
  return multipleCouponState[id].value === null
    ? null
    : new window.Date(multipleCouponState[id].value);
}
