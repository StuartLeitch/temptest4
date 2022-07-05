import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/gsw-demo.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      ...defaultValues.serviceProps.envVars,
    },
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-admin.demo-gsw.phenom.pub',
        },
        {
          host: 'demo-invoicing-admin.gsw.hindawi.com',
        },
      ],
    },
  },
};

export { values };
