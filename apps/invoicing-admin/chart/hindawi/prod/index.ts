import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ['prod/invoicing/invoicing-admin-legacy'],
  sopsSecrets: require('../../../config/prod.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
    },
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-admin.prod.phenom.pub',
        },
        {
          host: 'admin.invoicing.hindawi.com',
        },
      ],
    },
  },
};

export { values };
