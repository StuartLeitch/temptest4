import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import { ClientContext } from 'graphql-hooks';

import { useAuth } from '../contexts/Auth';

import UploadDashboard from './Pages/UploadDashboard';
import SuccessfulUpload from './Pages/SuccessfulUpload';

//------ Route Definitions --------
export const RoutedContent = () => {
  const client = useContext(ClientContext);
  const auth: any = useAuth();

  if (!auth) {
    return null;
  }
  const { token } = auth.data;

  // ! Do not use '===' for checking
  if (client.headers['Authorization'] == null) {
    client.setHeader('Authorization', `Bearer ${token}`);
  }

  return (
    <Routes>
      <Route path='/' element={<Navigate to='/transfer-manuscript' />} />

      {/*     Package Submission Routes      */}
      <Route
        path='/transfer-manuscript'
        element={
          <PrivateRoute>
            <UploadDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path='/successful-upload'
        element={
          <PrivateRoute>
            <SuccessfulUpload />
          </PrivateRoute>
        }
      />

      <Route
        path='*'
        element={<Navigate to='/transfer-manuscript' replace />}
      />
    </Routes>
  );
};

function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();

  // * If auth is not enabled
  if (typeof auth === 'object' && !auth) {
    return children;
  }

  const { data, login } = auth;
  if (!data || !data.isAuthenticated) {
    // * Ask user to login!
    login();
  }

  if (data && 'isAuthenticated' in data && data.isAuthenticated) {
    return children;
  }
}
