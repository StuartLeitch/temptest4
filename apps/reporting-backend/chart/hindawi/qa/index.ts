import {
  WithSopsSecretsServiceProps,
  ConfigurationMountType,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/../../../config/qa.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      AWS_SQS_DISABLED: 'false',
    },
  },
};

export { values };
