import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['dev/invoicing/invoicing-admin'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
      AUTH_SERVER_CLIENT_ID: 'invoicing',
      AUTH_SERVER_REALM: 'Hindawi',
      APP_NAME: 'Invoicing Admin',
    },
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-admin.dev.phenom.pub',
        },
      ],
    },
  },
};

export { values };
