import * as React from "react";
import { useAsync } from "react-async";
import { useLocation } from "react-router-dom";

import { PendingLogging } from "../pages/PendingLogging//PendingLogging";

/** Utils */
import { bootstrapAppData } from "../utils/bootstrap";
import { AuthClient } from "../utils/auth-client";

export const AuthContext = React.createContext(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = (props: any) => {
  const { pathname } = useLocation();

  const [firstAttemptFinished, setFirstAttemptFinished] = React.useState(false);
  const { data, error, isRejected, isPending, isSettled, reload } = useAsync({
    promiseFn: bootstrapAppData,
  });

  React.useLayoutEffect(() => {
    if (isSettled) {
      setFirstAttemptFinished(true);
    }
  }, [isSettled]);

  if (!firstAttemptFinished) {
    if (isPending) {
      // ! Ugly hack as fuck!
      return pathname === "/" ? <PendingLogging /> : null;
    }
    if (isRejected) {
      return (
        <div style={{ color: "red" }}>
          <p>Uh oh&hellip; There's a problem. Try refreshing the app.</p>
          <pre>{error.message}</pre>
        </div>
      );
    }
  }

  const login = () => {
    const boundLogin = AuthClient.login.bind(AuthClient);
    return boundLogin().then(reload);
  };
  const logout = () => {
    const boundLogout = AuthClient.logout.bind(AuthClient);
    return boundLogout().then(reload);
  };
  const foo = () => console.log("bar");

  return (
    <AuthContext.Provider value={{ data, login, logout, foo }} {...props} />
  );
};

function useAuth() {
  const context = React.useContext(AuthContext);

  if (context === undefined) {
    throw new Error(`useAuth must be used within a AuthProvider`);
  }

  return context;
}

export { AuthProvider, useAuth };
