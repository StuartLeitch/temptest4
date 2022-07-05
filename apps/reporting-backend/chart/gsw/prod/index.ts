import {
  WithSopsSecretsServiceProps,
  ConfigurationMountType,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ['gsw-prod/reporting/reporting-backend-legacy'],
  sopsSecrets: require('../../../config/gsw-prod.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
  },
};

export { values };
