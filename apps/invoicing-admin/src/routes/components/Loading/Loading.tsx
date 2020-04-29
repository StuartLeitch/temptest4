import React from 'react';
import LoadingOverlay from 'react-loading-overlay';

import { Spinner } from '../../../components';

export default ({ loading = true, children }) => (
  <LoadingOverlay
    active={loading}
    spinner={
      <Spinner style={{ width: '12em', height: '12em'}} color='primary' />
    }
  >
    {children}
  </LoadingOverlay>
);
