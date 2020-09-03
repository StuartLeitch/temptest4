import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['qa/invoicing/invoicing-graphql'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
      SCHEDULER_DB_HOST: 'sisif-redis-master',
    },
    secrets: {
      ['sisif-redis']: {
        as: ConfigurationMountType.ENV,
        items: {
          'redis-password': 'SCHEDULER_DB_PASSWORD',
        },
      },
    },
    ingressOptions: {
      host: 'invoicing-graphql.qa.phenom.pub',
    } as IngressOptionsSpec & { host: string },
  },
};

export { values };
