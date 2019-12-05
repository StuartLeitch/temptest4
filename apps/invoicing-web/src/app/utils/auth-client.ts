import Keycloak from "keycloak-js";

import { config } from "../../config";

class _AuthClient {
  private kc: Keycloak.KeycloakInstance<"native">;
  public authState: any = {
    isAuthenticated: false,
    user: null,
  };

  constructor() {
    const kcConfig = {
      url: config.authServerUrl,
      realm: config.authServerRealm,
      clientId: config.authServerClientId,
    };

    this.kc = Keycloak<"native">(kcConfig);
    this.kc.onAuthSuccess = () => this.handleAuthSuccess();
    this.kc.onAuthError = () => this.handleAuthError();
  }

  public async login() {
    const { kc } = this;
    return kc.login();
  }

  public async logout() {
    const { kc } = this;
    return kc.logout();
  }

  public async getUser() {
    const { user } = this.authState;

    if (!user) {
      // const isAuthenticated = await this.init();
      // return Promise.resolve({ user: this.authState.user });
      return Promise.resolve({ user: null });
    }

    return user;
  }

  public async isAuthenticated() {
    const isAuthenticated = await this.init();
    return isAuthenticated;
  }

  public async init() {
    const kcOptions = {
      onLoad: "check-sso",
      // onLoad: "login-required",
      promiseType: "native",
      // silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      // pkceMethod: "S256",
    };

    return await this.kc.init(kcOptions as any);
  }

  private async handleAuthSuccess() {
    const { kc } = this;
    const data = kc.tokenParsed as any;

    let user: any;

    if (data) {
      user = {
        username: data.preferred_username,
        name: data.name,
        email: data.email,
        token: kc.token,
        roles: data.resource_access.invoicing.roles,
      };
    }

    this.authState.user = user;
  }

  private handleAuthError() {
    this.authState.user = null;
  }
}

const AuthClient = new _AuthClient();

export { AuthClient };
