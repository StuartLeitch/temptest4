import { AuthClient } from "./auth-client";

async function bootstrapAppData() {
  const isAuthenticated = await AuthClient.isAuthenticated();

  // if (isAuthenticated) {
  //   const data = await AuthClient.getUser();

  //   if (data) {
  //     return { isAuthenticated, ...data };
  //   }
  // }

  return { isAuthenticated };
}

export { bootstrapAppData };
