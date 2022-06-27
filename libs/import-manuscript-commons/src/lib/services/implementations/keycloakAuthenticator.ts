import { Grant, Keycloak } from 'keycloak-connect';
import { VError } from 'verror';
import { LoggerBuilder } from '@hindawi/shared';

export class KeycloakAuthenticator {
  private authorization: Grant;

  constructor(
    private readonly username: string,
    private readonly password: string,
    private readonly keycloak: Keycloak,
    private readonly loggerBuilder: LoggerBuilder
  ) {
    this.loggerBuilder.getLogger(KeycloakAuthenticator.name);
  }

  public async getAuthorizationToken(): Promise<string> {
    await this.ensureFreshness();
    return this.authorization['access_token']['token'];
  }

  private async ensureFreshness(): Promise<void> {
    if (!this.authorization) {
      await this.obtainDirectly();
    }

    try {
      await this.keycloak.grantManager.ensureFreshness(this.authorization);
    } catch (exception) {
      try {
        await this.obtainDirectly();
      } catch (exception) {
        throw new VError(exception, 'Exception while trying to refresh token');
      }
    }
  }

  private async obtainDirectly(): Promise<void> {
    try {
      this.authorization = await this.keycloak.grantManager.obtainDirectly(
        this.username,
        this.password
      );
    } catch (exception) {
      throw new VError(
        exception,
        'Exception while trying to login with keycloak'
      );
    }
  }
}
