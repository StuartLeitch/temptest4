import React from 'react';
// import { Link } from 'react-router-dom';

import {
  // Button,
  // Label,
  // EmptyLayout,
  Spinner,
  ThemeConsumer
} from '../../../components';

import { HeaderAuth } from '../Pages/HeaderAuth';
// import { FooterAuth } from '../../components/Pages/FooterAuth';

export const PendingLogging = () => (
  <React.Fragment>
    {/* START Header */}
    <HeaderAuth
      text='This will take a moment, please wait&hellip;'
      title='Logging you in'
    />
    {/* END Header */}
    {/* START Spinner */}
    <ThemeConsumer>
      {({ color }) => (
        <div className='mb-4'>
          <div className='mb-4 text-center'>
            <Spinner style={{ width: '6em', height: '6em' }} color='primary' />
          </div>
        </div>
      )}
    </ThemeConsumer>
    {/* END Spinner */}
  </React.Fragment>
);
