import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['demo/invoicing/invoicing-admin-legacy'],
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
          host: 'invoicing-admin.demo.phenom.pub',
        },
        {
          host: 'demo-admin.invoicing.hindawi.com',
        },
      ],
    },
  },
};

export { values };
