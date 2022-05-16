import { Grant, Keycloak } from 'keycloak-connect';
import { VError } from 'verror';
import { LoggerBuilder, LoggerContract } from '@hindawi/shared';

export class KeycloakAuthenticator {
  private authorization: Grant;
  private logger: LoggerContract;
  constructor(
    private readonly username: string,
    private readonly password: string,
    private readonly keycloak: Keycloak,
    private readonly envVars: any
  ) {
    this.logger = new LoggerBuilder(
      'Import/Manuscript/Backend/KeycloakAuthenticator',
      {
        isDevelopment: this.envVars.isDevelopment,
        logLevel: this.envVars.log.level,
      }
    ).getLogger();
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
      throw new VError(exception, 'Exception while trying to refresh token');
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
