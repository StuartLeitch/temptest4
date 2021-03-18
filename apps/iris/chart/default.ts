import {
  WithAwsSecretsServiceProps,
  ServiceType,
} from '@hindawi/phenom-charts';

const defaultValues: WithAwsSecretsServiceProps = {
  secretNames: [],
  serviceProps: {
    image: {
      repository:
        '916437579680.dkr.ecr.eu-west-1.amazonaws.com/iris',
      tag: 'qa-latest',
    },
    replicaCount: 1,
    containerPort: 8088,
    envVars: {
      PORT: '8088',
    },
    service: {
      port: 80,
      type: ServiceType.NODE_PORT,
    },
    resources: {
      limits: {
        memory: 0
      },
      requests: {
        memory: 0
      }
    }
  },
};

export { defaultValues };
