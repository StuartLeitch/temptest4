import React, { useContext } from 'react';
import { Route, Switch, Redirect } from 'react-router';

import { ClientContext } from 'graphql-hooks';

import { useAuth } from '../contexts/Auth';

import UploadDashboard from './Pages/UploadDashboard';
import SuccessfulUpload from './Pages/SuccessfulUpload';

//------ Route Definitions --------
export const RoutedContent = () => {
  const auth: any = useAuth();

  if (!auth) {
    return null;
  }
  const { token } = auth.data;

  const client = useContext(ClientContext);

  // ! Do not use '===' for checking
  if (client.headers['Authorization'] == null) {
    client.setHeader('Authorization', `Bearer ${token}`);
  }

  return (
    <Switch>
      <Redirect from='/' to='/transfer-manuscript' exact />
      {/*     Package Submission Routes      */}
      <PrivateRoute exact path='/transfer-manuscript'>
        <UploadDashboard />
      </PrivateRoute>
      <PrivateRoute exact path='/successful-upload'>
        <SuccessfulUpload />
      </PrivateRoute>
      {/*    404    */}
      <Redirect to='/pages/error-404' />
    </Switch>
  );
};

function childrenInRoute(children: any, pathMatch: any, params: any) {
  const toRender = <React.Suspense fallback={null}>{children}</React.Suspense>;
  return <Route {...params} render={() => toRender} />;
}

function PrivateRoute({ children, ...rest }: any): any {
  const auth = useAuth();

  // * If auth is not enabled
  if (typeof auth === 'object' && !auth) {
    return childrenInRoute(children, rest.computedMatch, rest);
  }

  const { data, login }: any = auth;
  if (!data || !data.isAuthenticated) {
    // * Ask user to login!
    login();

    return null;
  }

  if (data && 'isAuthenticated' in data && data.isAuthenticated) {
    return childrenInRoute(children, rest.computedMatch, rest);
  }
}

