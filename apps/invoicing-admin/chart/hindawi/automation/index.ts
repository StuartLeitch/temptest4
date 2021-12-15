import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['automation/invoicing/invoicing-admin'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
      AUTH_SERVER_CLIENT_ID: 'invoicing',
      AUTH_SERVER_REALM: 'Phenom',
      APP_NAME: 'Invoicing',
    },
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-admin.automation.phenom.pub',
        },
      ],
    },
  },
};

export { values };
