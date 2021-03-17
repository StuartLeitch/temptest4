import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['qa/iris/backend'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      AWS_SQS_DISABLED: 'false',
    },
    ingressOptions: {
      rules: [
        {
          host: 'reporting.qa.phenom.pub',
        },
      ],
    }
  },
};

export { values };
