import { WithAwsSecretsServiceProps } from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ["demo-sales/invoicing/invoicing-web-legacy"],
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
    ingressOptions: {
      rules: [
        {
          host: "invoicing-web.demo-sales.phenom.pub",
        },
      ],
    },
  },
};

export { values };
