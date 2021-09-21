import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: [
    'demo-sales/invoicing/invoicing-revenue-recognition-registration',
  ],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host:
            'invoicing-revenue-recognition-registration.demo-sales.phenom.pub',
        },
      ],
    },
  },
};

export { values };
