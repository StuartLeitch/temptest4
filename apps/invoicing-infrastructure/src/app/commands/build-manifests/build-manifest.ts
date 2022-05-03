import {
  HindawiServiceChart,
  WithAwsSecretsServiceProps,
} from '@hindawi/phenom-charts';
import { App as Cdk8sApp } from 'cdk8s';
import url from 'url';

import { Command } from '../../contracts';
import { getOsEnv } from '../../env';
import { App } from '../../types';
import { masterConfig } from './config.gen';

function makeAppEnum(app: string): App | null {
  switch (app) {
    case App.admin:
    case App.graphql:
    case App.web:
    case App.reporting:
    case App.importManuscriptBackend:
    case App.importManuscriptValidation:
    case App.invoicingErpInvoiceRegistration:
    case App.importManuscriptWeb:
      return app as App;

    default:
      console.log(`Application ${app} not found:`);
      return null;
  }
}

interface EnvProps {
  tenant: string;
  environment: string;
  affectedApps: App[];
  requiredApps: App[];
  tag: string;
  awsRegistry: string;
}

export class BuildManifestsCommand implements Command {
  private parseEnv(): EnvProps {
    const tenant: string = getOsEnv('TENANT');
    const environment: string = getOsEnv('NODE_ENV');
    const tag: string = getOsEnv('CI_COMMIT_SHA');
    const awsRegistry: string = getOsEnv('AWS_REGISTRY');
    const apps: App[] = getOsEnv('AFFECTED_APPS')
      .split(/[\s,]/)
      .map((a) => a.trim())
      .map(makeAppEnum)
      .filter((a) => a);
    const requiredApps: App[] = getOsEnv('REQUIRED_APPS')
      .split(/[\s,]/)
      .map((a) => a.trim())
      .map(makeAppEnum)
      .filter((a) => a);

    return {
      tenant,
      environment,
      affectedApps: apps,
      requiredApps,
      tag,
      awsRegistry,
    };
  }

  async run(...args: string[]): Promise<void> {
    const env = this.parseEnv();
    const rootConstruct = new Cdk8sApp({ outdir: 'dist-k8s' });
    for (const app of env.requiredApps) {
      let appProps: WithAwsSecretsServiceProps;
      try {
        appProps = masterConfig[env.tenant][env.environment][app];
        appProps.serviceProps.image.repository = `${env.awsRegistry}/${app}`;
        //if one of the required apps for the deployment hasn't been affected by changes then we deploy latest
        if(env.affectedApps.some(affectedApp => affectedApp === app)) {
          appProps.serviceProps.image.tag = env.tag;
        } else{
          appProps.serviceProps.image.tag = 'latest'
        }
        if (!appProps) {
          throw new Error('Not found configuration for app');
        }
      } catch (error) {
        // maybe throw
        console.error(
          `Did not find configuration for ${app}, tenant: ${env.tenant}, environment: ${env.environment}`
        );
        // todo delete contiune, this should exit with error
        continue;
      }
      console.log('building ' + app);
      await HindawiServiceChart.withAwsSecrets(rootConstruct, app, appProps);
    }
    rootConstruct.synth();
    console.log(`Successfully built: ${env.affectedApps}`);
  }
}
