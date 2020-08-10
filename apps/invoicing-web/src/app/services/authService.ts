import { Config } from "@hindawi/invoicing-web/config";
import { BehaviorSubject } from "rxjs";

import Keycloak from "keycloak-js";

export interface AuthSession {
  user: string;
  name: string;
  email: string;
  token: string;
  roles: string[];
}

export enum AuthStatus {
  NOT_INITIALIZED = "NOT_INITIALIZED",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface AuthState {
  session?: AuthSession;
  status: AuthStatus;
}

export class AuthService {
  private keycloak: Keycloak.KeycloakInstance;
  public $state: BehaviorSubject<AuthState>;

  constructor(config: Config) {
    this.keycloak = Keycloak({
      url: config.authServerUrl,
      realm: config.authServerRealm,
      clientId: config.authServerClientId,
    });

    this.keycloak.onAuthSuccess = () => this.handleAuthSuccess();
    this.keycloak.onAuthError = () => this.handleAuthError();

    this.$state = new BehaviorSubject({
      status: AuthStatus.NOT_INITIALIZED,
    });
  }

  init() {
    this.$state.next({
      status: AuthStatus.IN_PROGRESS,
    });

    this.keycloak.init({
      onLoad: "login-required",
      // promiseType: 'native',
    });
  }

  private async handleAuthSuccess() {
    const { keycloak } = this;
    const data = keycloak.tokenParsed as any;

    let session: AuthSession;

    if (data) {
      session = {
        user: data.username,
        name: data.name,
        email: data.email,
        token: keycloak.token,
        roles: data.resource_access.phenom.roles,
      };
    }

    this.$state.next({
      status: AuthStatus.SUCCESS,
      session,
    });
  }

  private handleAuthError() {
    this.$state.next({
      status: AuthStatus.ERROR,
      session: undefined,
    });
  }
}
