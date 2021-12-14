import React from 'react';

import {
  Spinner,
  ThemeConsumer
} from '../../../components';

import { HeaderAuth } from '../Pages/HeaderAuth';

export const PendingLogging: React.FC = () => (
  <React.Fragment>
    <div style={{ marginTop: '150px' }}>
        {/* START Header */}
        <HeaderAuth
          text='This will take a moment, please wait&hellip;'
          title='Logging you in'
        />
        {/* END Header */}
        {/* START Spinner */}
        <ThemeConsumer>
          {() => (
            <div className='mb-4'>
              <div className='mb-4 text-center'>
                <Spinner style={{ width: '6em', height: '6em' }} color='primary' />
              </div>
            </div>
          )}
        </ThemeConsumer>
        {/* END Spinner */}
      </div>
  </React.Fragment>
);
