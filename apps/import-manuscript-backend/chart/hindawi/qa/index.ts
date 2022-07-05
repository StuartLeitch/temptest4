import {
  WithSopsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/qa.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'import-manuscript-backend.qa.phenom.pub',
        },
      ],
    },
  },
};

export { values };
