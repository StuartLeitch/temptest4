import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/qa.enc.json'),
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
          host: 'invoicing-admin.qa.phenom.pub',
        },
      ],
    },
  },
};

export { values };
