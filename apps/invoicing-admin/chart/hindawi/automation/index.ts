import { WithSopsSecretsServiceProps } from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/automation.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
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
