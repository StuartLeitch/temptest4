import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['gsw-prod/invoicing/invoicing-graphql-legacy'],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-graphql.gsw-prod.phenom.pub',
        },
      ],
    },
  },
};

export { values };
