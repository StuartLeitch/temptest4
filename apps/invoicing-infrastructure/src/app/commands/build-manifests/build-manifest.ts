import { App as Cdk8sApp } from 'cdk8s';
import { Command } from '../../contracts';
import { getOsEnv } from '../../env';
import { App } from '../../types';
import { masterConfig } from './config.gen';
import {
  WithAwsSecretsServiceProps,
  HindawiServiceChart,
} from '@hindawi/phenom-charts';

function makeAppEnum(app: string): App | null {
  switch (app) {
    case App.admin:
    case App.graphql:
    case App.web:
    case App.reporting:
      return app as App;

    default:
      console.log(`Application ${app} not found:`);
      return null;
  }
}

interface EnvProps {
  tenant: string;
  environment: string;
  apps: App[];
}

export class BuildManifestsCommand implements Command {
  private parseEnv(): EnvProps {
    let tenant: string = getOsEnv('TENANT');
    let environment: string = getOsEnv('NODE_ENV');
    let apps: App[] = getOsEnv('AFFECTED_APPS')
      .split(',')
      .map((a) => a.trim())
      .map(makeAppEnum)
      .filter((a) => a);

    return {
      tenant,
      environment,
      apps,
    };
  }

  async run(...args: string[]): Promise<void> {
    const env = this.parseEnv();
    const rootConstruct = new Cdk8sApp({ outdir: 'dist-k8s' });
    for (const app of env.apps) {
      let appProps: WithAwsSecretsServiceProps;
      try {
        appProps = masterConfig[app][env.tenant][env.environment];
      } catch (error) {
        // maybe throw
        console.error(
          `Did not find configuration for ${app}, tenant: ${env.tenant}, environment: ${env.environment}`
        );
        // todo delete contiune, this should exit with error
        continue;
      }
      console.log(app, appProps);
      await HindawiServiceChart.withAwsSecrets(rootConstruct, app, appProps);
    }
    rootConstruct.synth();
  }
}
