import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ["prod/invoicing/invoicing-web-legacy"],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
    ingressOptions: {
      rules: [
        {
          host: "invoicing-web.prod.phenom.pub",
        },
        {
          host: "invoicing.hindawi.com",
        },
      ],
    },
  },
};

export { values };
