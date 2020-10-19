import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ["demo-gsw/invoicing/invoicing-web-legacy"],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
    ingressOptions: {
      rules: [
        {
          host: "invoicing-web.demo-gsw.phenom.pub",
        },
        {
          host: "demo.invoicing.gsw.hindawi.com",
        },
      ],
    },
  },
};

export { values };
