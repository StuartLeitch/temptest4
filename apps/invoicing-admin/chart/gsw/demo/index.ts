import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['gsw-demo/invoicing/invoicing-admin-legacy'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
    },
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-admin.demo-gsw.phenom.pub',
        },
        {
          host: 'demo-invoicing-admin.gsw.hindawi.com',
        },
      ],
    },
  },
};

export { values };
