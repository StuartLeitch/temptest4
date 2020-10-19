import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['gsw-prod/reporting/reporting-backend-legacy'],
  serviceProps: {
    ...defaultValues.serviceProps,
  },
};

export { values };
