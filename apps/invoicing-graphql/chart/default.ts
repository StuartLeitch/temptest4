import {
  WithAwsSecretsServiceProps,
  ServiceType,
} from '@hindawi/phenom-charts';

const defaultValues: WithAwsSecretsServiceProps = {
  secretNames: [],
  serviceProps: {
    image: {
      repository:
        '916437579680.dkr.ecr.eu-west-1.amazonaws.com/invoicing-graphql',
      tag: 'latest',
    },
    replicaCount: 1,
    containerPort: 3000,
    envVars: {
      PORT: '3000',
    },
    service: {
      port: 80,
      type: ServiceType.NODE_PORT,
    },
    labels: {
      owner: 'belzebuth',
      tier: 'backend',
    },
  },
};

export { defaultValues };
