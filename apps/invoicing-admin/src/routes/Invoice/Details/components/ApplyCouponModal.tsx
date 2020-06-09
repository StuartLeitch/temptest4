import React, { useState } from 'react';
import { useMutation } from 'graphql-hooks';
import { func, string } from 'prop-types';
import { Button } from 'reactstrap';

import {
  UncontrolledModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../../../components';

import { APPLY_COUPON_MUTATION } from '../../graphql';

import { Code } from '../../../Coupon/components/Fields';

const ApplyCouponModal = ({ target, onSuccessCallback, invoiceId }: ApplyCouponModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputValid, setValid] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState('');

  const [applyCoupon] = useMutation(APPLY_COUPON_MUTATION);

  const onChange = (value, isValid) => {
    setInputValue(value);
    setValid(isValid);
  };

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

      const error = applyCouponResult?.error?.graphQLErrors[0].message;
      if (!error) {
        onSuccessCallback();
      } else {
        setError(error);
      }
    } catch (e) {
      setError('An error occurred. Please try again.');
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
        <Code onChangeCallback={onChange} />
      </ModalBody>

      <ModalFooter className='justify-content-between'>
        <span className='medium text-muted text-danger w-50'>{error}</span>

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

interface ApplyCouponModalProps {
  invoiceId: string;
  target: string;
  onSuccessCallback(): void;
}

ApplyCouponModal.propTypes = {
  target: string.isRequired,
  onSuccessCallback: func,
  invoiceId: string.isRequired,
};

export default ApplyCouponModal;
