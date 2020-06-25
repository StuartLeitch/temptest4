import React from 'react';

interface ConfigProps {
  sidebarHidden?: boolean;
  navbarHidden?: boolean;
  [key: string]: any;
}

const PageConfigContext = React.createContext<ConfigProps>({});

export {
    PageConfigContext
};
