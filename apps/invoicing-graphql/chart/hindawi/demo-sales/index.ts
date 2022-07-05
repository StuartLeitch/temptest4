import { WithSopsSecretsServiceProps } from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ['demo-sales/invoicing/invoicing-graphql-legacy'],
  sopsSecrets: require('../../../config/demo-sales.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'invoicing-graphql.demo-sales.phenom.pub',
        },
      ],
    },
  },
};

export { values };
