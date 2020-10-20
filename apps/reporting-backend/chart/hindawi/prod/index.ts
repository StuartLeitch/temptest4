import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['prod/reporting/reporting-backend'],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
  },
};

export { values };
