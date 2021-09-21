import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['demo/invoicing/invoicing-erp-payment-registration'],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-erp-payment-registration.demo.phenom.pub',
        },
      ],
    },
  },
};

export { values };
