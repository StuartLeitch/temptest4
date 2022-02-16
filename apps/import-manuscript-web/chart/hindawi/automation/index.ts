import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['automation/review/import-manuscript-web'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
    },
    ingressOptions: {
      rules: [
        {
          host: 'import-manuscript.automation.phenom.pub',
        },
      ],
    },
  },
};

export { values };
