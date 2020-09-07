import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ["qa/invoicing/invoicing-web"],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      TENANT_NAME: "Hindawi",
      NODE_ENV: "dev",
    },
    ingressOptions: {
      host: "invoicing-web.qa.phenom.pub",
    },
  },
};

export { values };
