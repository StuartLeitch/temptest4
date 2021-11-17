import {
  WithAwsSecretsServiceProps,
  ConfigurationMountType,
  IngressOptionsSpec,
} from '@hindawi/phenom-charts';
import { defaultValues } from '../../default';

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ['prod/review/import-manuscript'],
  serviceProps: {
    ...defaultValues.serviceProps,
    ingressOptions: {
      rules: [
        {
          host: 'import-manuscriptl.prod.phenom.pub',
        },
        {
          host: 'prod-gql.import-manuscript.hindawi.com',
        },
      ],
    },
    resources: {
      limits: {
        memory: '1000Mi',
      },
      requests: {
        memory: '1000Mi',
        cpu: '1',
      },
    },
  },
};

export { values };
