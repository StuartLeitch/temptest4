import React from 'react';
import { PageConfigContext } from './PageConfigContext';

// eslint-disable-next-line @typescript-eslint/ban-types
export const withPageConfig = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  const WithPageConfig = (props) => (
    <PageConfigContext.Consumer>
    {
      (pageConfig) => <Component pageConfig={ pageConfig } { ...props } />
    }
    </PageConfigContext.Consumer>
  );
  return WithPageConfig;
};
