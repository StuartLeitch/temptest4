import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['qa/reporting/backend'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      AWS_SQS_DISABLED: 'false',
    },
  },
};

export { values };
