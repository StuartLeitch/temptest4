import {
  WithSopsSecretsServiceProps,
  ConfigurationMountType,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/automation.enc.json'),
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
      rules: [
        {
          host: 'invoicing-graphql.automation.phenom.pub',
        },
      ],
    },
  },
};

export { values };
