import React from 'react';

import { Media } from './../../../../components';

export default () => (
  <Media>
    <Media middle left className='mr-3'>
      <i className='fas fa-fw fa-2x fa-check'></i>
    </Media>
    <Media body>
      <Media heading tag='h6'>
        Info
      </Media>
      <p>
        <span className='font-weight-bold text-success'>
          The Search Filters have been copied to your clipboard.
        </span>
      </p>
    </Media>
  </Media>
);
