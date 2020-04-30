import React from 'react';
import LoadingOverlay from 'react-loading-overlay';

import { Spinner } from '../../../components';

// can be either used as a HOC or individual component
export default ({ loading = true, children = null }) => (
  <LoadingOverlay
    active={loading}
    spinner={
      <Spinner
        style={{ width: '12em', height: '12em' }}
        color='primary'
      />
    }
  >
    {children}
  </LoadingOverlay>
);
