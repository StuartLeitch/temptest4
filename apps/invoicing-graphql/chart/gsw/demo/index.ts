import {
  WithSopsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ['gsw-demo/invoicing/invoicing-graphql-legacy'],
  sopsSecrets: require('../../../config/gsw-demo.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-graphql.demo-gsw.phenom.pub',
        },
      ],
    },
  },
};

export { values };
