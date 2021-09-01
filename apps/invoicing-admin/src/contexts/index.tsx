import React, { useState } from 'react';

// import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import config from '../config';

import { AuthProvider } from './Auth';
import { UserProvider } from './User';

import {Permission, User} from "./PermissionTypes";
import PermissionProvider from "./PermissionProvider";

function AppProviders({ children }) {
  const { authEnabled } = config;

  const renderAuthProvider = () => {
    if (authEnabled) {
      return (
        <AuthProvider>
          <UserProvider>
            <PermissionProvider>
              {children}
            </PermissionProvider>
            </UserProvider>
        </AuthProvider>
      );
    } else {
      return children;
    }
  };
  return <BrowserRouter>{renderAuthProvider()}</BrowserRouter>;
}

export default AppProviders;
