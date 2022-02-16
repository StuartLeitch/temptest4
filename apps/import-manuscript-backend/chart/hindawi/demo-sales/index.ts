import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['demo-sales/review/import-manuscript-backend'],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'import-manuscript-backend.demo-sales.phenom.pub',
        },
      ],
    },
  },
};

export { values };
