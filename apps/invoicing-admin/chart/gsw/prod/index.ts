import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/gsw-prod.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
    },
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-admin.gsw-prod.phenom.pub',
        },
        {
          host: 'prod-invoicing-admin.gsw.hindawi.com',
        },
      ],
    },
  },
};

export { values };
