import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['gsw-prod/invoicing/invoicing-admin-legacy'],
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
