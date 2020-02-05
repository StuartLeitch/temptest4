import React from 'react';

// import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import config from '../config';

import { AuthProvider } from './Auth';
import { UserProvider } from './User';

function AppProviders({ children }) {
  const { authEnabled } = config;

  const renderAuthProvider = () => {
    if (authEnabled) {
      return (
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      );
    } else {
      return children;
    }
  };
  return <BrowserRouter>{renderAuthProvider()}</BrowserRouter>;
}

export default AppProviders;
