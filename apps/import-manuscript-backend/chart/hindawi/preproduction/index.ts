import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['preproduction/review/import-manuscript'],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'import-manuscript.preproduction.phenom.pub',
        },
      ],
    },
    resources: {
      limits: {
        memory: '1000Mi',
      },
      requests: {
        memory: '1000Mi',
        cpu: '1',
      },
    },
  },
};

export { values };
