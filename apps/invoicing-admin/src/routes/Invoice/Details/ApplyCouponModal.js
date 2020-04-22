import React, { useState } from 'react';
import { useMutation } from 'graphql-hooks';
import { func, string } from 'prop-types';

import { APPLY_COUPON_MUTATION } from '../graphql';

import {
  UncontrolledModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../../components';

import CouponCodeInput from './CouponCodeInput';

const ApplyCouponModal = ({
  target,
  applyCouponRequest,
  onSuccessCallback,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputValid, setValid] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const [applyCoupon] = useMutation(APPLY_COUPON_MUTATION);

  const apply = () => {};

  return (
    <UncontrolledModal target={target}>
      <ModalHeader tag='h6'>
        <i className='fas fa-ticket-alt mr-2'></i> Apply Coupon
      </ModalHeader>

      <ModalBody>
        <CouponCodeInput
          onChangeCallback={setInputValue}
          validationCallback={setValid}
        />
      </ModalBody>

      <ModalFooter>
        <UncontrolledModal.Close color='link' className='text-primary'>
          <i className='fas fa-close mr-2'></i>
          Close
        </UncontrolledModal.Close>
        <UncontrolledModal.Close disabled={!isInputValid} color='primary'>
          <i className='fas fa-check mr-2'></i>
          {inProgress && <i className='fas fa-fw fa-spinner fa-spin mr-2'></i>}
          Apply
        </UncontrolledModal.Close>
      </ModalFooter>
    </UncontrolledModal>
  );
};

ApplyCouponModal.propTypes = {
  target: string,
  applyCouponRequest: func,
  onSuccessCallback: func,
};

export default ApplyCouponModal;
