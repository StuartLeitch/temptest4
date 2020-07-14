import {
  WithAwsSecretsServiceProps,
  ServiceType,
} from '@hindawi/phenom-charts';

const defaultValues: WithAwsSecretsServiceProps = {
  secretNames: [],
  serviceProps: {
    image: {
      repository:
        '916437579680.dkr.ecr.eu-west-1.amazonaws.com/reporting-backend',
      tag: 'latest',
    },
    replicaCount: 1,
    labels: {
      owner: 'belzebuth',
      tier: 'backend',
    },
  },
};

export { defaultValues };
