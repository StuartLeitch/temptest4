import {
  WithAwsSecretsServiceProps,
  ServiceType,
} from '@hindawi/phenom-charts';

const defaultValues: WithAwsSecretsServiceProps = {
  secretNames: [],
  serviceProps: {
    replicaCount: 1,
    service: {
      port: 80,
      type: ServiceType.CLUSTER_IP,
    },
    labels: {
      owner: 'belzebuth',
      tier: 'frontend',
    },
  },
};

export { defaultValues };
