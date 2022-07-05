import {
  WithSopsSecretsServiceProps,
  ServiceType,
} from '@hindawi/phenom-charts';

const defaultValues: WithSopsSecretsServiceProps = {
  sopsSecrets: null,
  serviceProps: {
    image: {
      repository:
        '916437579680.dkr.ecr.eu-west-1.amazonaws.com/invoicing-admin',
      tag: 'latest',
    },
    containerPort: 3000,
    replicaCount: 1,
    service: {
      port: 80,
      type: ServiceType.NODE_PORT,
    },
    labels: {
      owner: 'belzebuth',
      tier: 'frontend',
    },
  },
};

export { defaultValues };
