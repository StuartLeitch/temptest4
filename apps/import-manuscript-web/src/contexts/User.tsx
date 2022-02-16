import React from 'react';
import { useAuth } from './Auth';

const UserContext = React.createContext(null);

function UserProvider(props: any) {
  const { data } = useAuth();

  let user = null;
  if (data && 'user' in data) {
    user = data.user;
  }
  return <UserContext.Provider value={user} {...props} />;
}

function useUser() {
  const context = React.useContext(UserContext);
  if (typeof context === 'undefined') {
    throw new Error(`useUser must be used within a UserProvider`);
  }
  return context;
}

export { UserProvider, useUser };
