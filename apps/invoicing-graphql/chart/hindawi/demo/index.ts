import {
  WithSopsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ['demo/invoicing/invoicing-graphql-legacy'],
  sopsSecrets: require('../../../config/demo.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-graphql.demo.phenom.pub',
        },
      ],
    },
  },
};

export { values };
