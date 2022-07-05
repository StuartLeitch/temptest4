import {
  WithSopsSecretsServiceProps,
  ConfigurationMountType,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/prod.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
  },
};

export { values };
