import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: [
    'gsw-prod/invoicing/invoicing-revenue-recognition-registration',
  ],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host:
            'invoicing-revenue-recognition-registration.gsw-prod.phenom.pub',
        },
      ],
    },
  },
};

export { values };
