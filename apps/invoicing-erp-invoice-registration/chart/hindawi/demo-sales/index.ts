import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['demo-sales/invoicing/invoicing-erp-invoice-registration'],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-erp-invoice-registration.demo-sales.phenom.pub',
        },
      ],
    },
  },
};

export { values };
