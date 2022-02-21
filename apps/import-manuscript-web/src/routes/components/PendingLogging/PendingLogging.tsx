import React from 'react';

import {
  Spinner
} from '@hindawi/phenom-ui';

import { HeaderAuth } from '../Pages/HeaderAuth';

export const PendingLogging: React.FC = () => (
  <React.Fragment>
    {/* START Header */}
    <HeaderAuth
      text='This will take a moment, please wait&hellip;'
      title='Logging you in'
    />
    {/* END Header */}
    {/* START Spinner */}
    <div className='mb-4'>
      <div className='mb-4 text-center'>
        <Spinner size='large' />
      </div>
    </div>
    {/* END Spinner */}
  </React.Fragment>
);
