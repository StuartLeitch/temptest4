import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['prod/invoicing/invoicing-graphql-legacy'],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-graphql.prod.phenom.pub',
        },
        {
          host: 'prod-gql.invoicing.hindawi.com',
        },
      ],
    },
  },
};

export { values };
