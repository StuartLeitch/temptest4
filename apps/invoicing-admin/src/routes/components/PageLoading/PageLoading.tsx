import React from 'react';
import LoadingOverlay from 'react-loading-overlay';

import { Spinner } from '../../../components';

export default () => (
  <LoadingOverlay
    active
    spinner={
      <Spinner style={{ width: '12em', height: '12em' }} color='primary' />
    }
  />
);
