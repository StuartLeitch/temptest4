import React from 'react';

import { Button, Media } from '../../../../components';

const ErrorPaymentToast: React.FC<ErrorPaymentToastProps> = ({
  closeToast,
}) => (
  <Media>
    <Media middle left className='mr-3'>
      <i className='fas fa-fw fa-2x fa-check'></i>
    </Media>
    <Media body>
      <Media heading tag='h6'>
        Failed!
      </Media>
      <p>Bank transfer payment failed.</p>
      <div className='d-flex mt-2'>
        <Button
          color='danger'
          onClick={() => {
            closeToast();
          }}
        >
          Got it
        </Button>
        <Button
          color='link'
          onClick={() => {
            closeToast();
          }}
          className='ml-2 text-success'
        >
          Cancel
        </Button>
      </div>
    </Media>
  </Media>
);

interface ErrorPaymentToastProps {
  closeToast(): void;
}

export default ErrorPaymentToast;
