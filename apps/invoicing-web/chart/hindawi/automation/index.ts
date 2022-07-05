import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  sopsSecrets: require('../../../config/automation.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      TENANT_NAME: "Hindawi",
      NODE_ENV: "dev",
    },
    ingressOptions: {
      rules: [
        {
          host: "invoicing-web.automation.phenom.pub",
        },
      ],
    },
  },
};

export { values };
