import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['demo-sales/invoicing/invoicing-admin-legacy'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
    },
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-admin.demo-sales.phenom.pub',
        },
      ],
    },
  },
};

export { values };
