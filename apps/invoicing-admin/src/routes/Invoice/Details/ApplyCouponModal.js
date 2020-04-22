import React, { useState } from 'react';

import {
  UncontrolledModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../../components';

import CouponCodeInput from './CouponCodeInput';

const ApplyCouponModal = ({ target }) => {
  const [isInputValid, setValid] = useState(false);

  return (
    <UncontrolledModal target={target}>
      <ModalHeader tag='h6'>
        <i className='fas fa-ticket-alt mr-2'></i> Apply Coupon
      </ModalHeader>

      <ModalBody>
        <CouponCodeInput validationCallback={setValid} />
      </ModalBody>

      <ModalFooter>
        <UncontrolledModal.Close color='link' className='text-primary'>
          <i className='fas fa-close mr-2'></i>
          Close
        </UncontrolledModal.Close>
        <UncontrolledModal.Close disabled={!isInputValid} color='primary'>
          <i className='fas fa-check mr-2'></i>
          Save
        </UncontrolledModal.Close>
      </ModalFooter>
    </UncontrolledModal>
  );
};

export default ApplyCouponModal;
