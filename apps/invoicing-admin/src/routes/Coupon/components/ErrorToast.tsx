import React from 'react';

import { Button, Media } from '../../../components';

const ErrorToast: React.FC<ErrorToastProps> = ({ closeToast, error }) => (
  <Media>
    <Media middle left className='mr-3'>
      <i className='fas fa-fw fa-2x fa-close'></i>
    </Media>
    <Media body>
      <Media heading tag='h6'>
        Error !
      </Media>
      <p>
        {error
          ? error
          : 'Something has occurred while trying to save the Coupon. Please try again.'}
      </p>
      <div className='d-flex mt-2'>
        <Button
          color='danger'
          onClick={() => {
            closeToast();
          }}
        >
          I Understand
        </Button>
        <Button
          color='link'
          onClick={() => {
            closeToast();
          }}
          className='ml-2 text-danger'
        >
          Cancel
        </Button>
      </div>
    </Media>
  </Media>
);

interface ErrorToastProps {
  error: string;
  closeToast(): void;
}

export default ErrorToast;
