import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ["dev/invoicing/invoicing-web"],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {
      TENANT_NAME: "Hindawi",
      NODE_ENV: "dev",
    },
    ingressOptions: {
      host: "invoicing-web.dev.phenom.pub",
    } as IngressOptionsSpec & { host: string },
  },
};

export { values };
