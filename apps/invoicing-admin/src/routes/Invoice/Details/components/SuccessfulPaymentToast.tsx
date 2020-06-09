import React from 'react';

import { Button, Media } from '../../../../components';

export default ({ closeToast }) => (
  <Media>
    <Media middle left className='mr-3'>
      <i className='fas fa-fw fa-2x fa-check'></i>
    </Media>
    <Media body>
      <Media heading tag='h6'>
        Success!
      </Media>
      <p>You successfully processed a bank transfer payment.</p>
      <div className='d-flex mt-2'>
        <Button
          color='success'
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
