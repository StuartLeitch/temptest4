import React, { ReactNode } from 'react';
import LoadingOverlay from 'react-loading-overlay';

import { Spinner } from '@hindawi/phenom-ui';

// can be either used as a HOC or individual component
const Loading: React.FC<LoadingProps> = ({ loading = true, children = null }) => (
  <LoadingOverlay
    active={loading}
    spinner={
      <Spinner
        size="large"
      />
    }
  >
    {children}
  </LoadingOverlay>
);

interface LoadingProps {
  loading?: boolean;
  children?: ReactNode;
};

export default Loading;
