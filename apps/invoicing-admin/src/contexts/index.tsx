import React from 'react';

import config from '../config';

import { AuthProvider } from './Auth';
import { UserProvider } from './User';

import PermissionProvider from './PermissionProvider';

function AppProviders({ children }) {
  const { authEnabled } = config;

  const renderAuthProvider = () => {
    if (authEnabled) {
      return (
        <AuthProvider>
          <UserProvider>
            <PermissionProvider>{children}</PermissionProvider>
          </UserProvider>
        </AuthProvider>
      );
    } else {
      return children;
    }
  };
  return renderAuthProvider();
}

export default AppProviders;
