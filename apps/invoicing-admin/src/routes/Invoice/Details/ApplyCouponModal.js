import React, { useState } from 'react';
import { useMutation } from 'graphql-hooks';
import { func, string } from 'prop-types';

import { APPLY_COUPON_MUTATION } from '../graphql';

import { Button } from 'reactstrap';

import {
  UncontrolledModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../../components';

import CouponCodeInput from './CouponCodeInput';

const ApplyCouponModal = ({ target, onSuccessCallback, invoiceId }) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputValid, setValid] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState('');

  const [applyCoupon] = useMutation(APPLY_COUPON_MUTATION);

  const apply = async () => {
    setInProgress(true);
    setError('');

    try {
      const applyCouponResult = await applyCoupon({
        variables: {
          couponCode: inputValue,
          invoiceId,
        },
      });

      const error = applyCouponResult.data.applyCoupon.error;
      if (error) setError(error);
    } catch (e) {
      console.log(e);
      setError('An error occured. Please try again.');
    }

    setInProgress(false);
  };

  const onModalClose = () => {
    setError('');
  };

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

      <ModalFooter className='justify-content-between'>
        <span className='medium text-muted text-warning'>{error}</span>

        <div>
          <UncontrolledModal.Close
            onClose={onModalClose}
            color='link'
            className='text-primary'
          >
            <i className='fas fa-close mr-2'></i>
            Close
          </UncontrolledModal.Close>

          <Button onClick={apply} disabled={!isInputValid} color='primary'>
            {inProgress ? (
              <i className='fas fa-fw fa-spinner fa-spin mr-2'></i>
            ) : (
              <i className='fas fa-check mr-2'></i>
            )}
            Apply
          </Button>
        </div>
      </ModalFooter>
    </UncontrolledModal>
  );
};

ApplyCouponModal.propTypes = {
  target: string.isRequired,
  onSuccessCallback: func,
  invoiceId: string.isRequired,
};

export default ApplyCouponModal;
