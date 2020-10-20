import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ["demo/invoicing/invoicing-web-legacy"],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
    ingressOptions: {
      rules: [
        {
          host: "invoicing-web.demo.phenom.pub",
        },
        {
          host: "demo.invoicing.hindawi.com",
        },
      ],
    },
  },
};

export { values };
