import {
  WithSopsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ['gsw-prod/invoicing/invoicing-graphql-legacy'],
  sopsSecrets: require('../../../config/gsw-prod.enc.json'),
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
