import React from 'react';

import { HeaderAuth } from '../Pages/HeaderAuth';

export const NotAuthorized: React.FC = () => (
  <React.Fragment>
    { /* START Header */}
    <HeaderAuth
        title="Not authorized"
        icon="do-not-enter"
        iconClassName="text-danger"
        text='You are not authorized to perform this action'
    />
    { /* END Header */}
  </React.Fragment>
);
