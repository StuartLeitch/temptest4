import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['demo/review/import-manuscript-backend'],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'import-manuscript-backend.demo.phenom.pub',
        },
        {
          host: 'demo-gql.import-manuscript-backend.hindawi.com',
        },
      ],
    },
  },
};

export { values };
