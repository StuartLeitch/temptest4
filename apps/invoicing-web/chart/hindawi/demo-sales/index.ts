import { WithSopsSecretsServiceProps } from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ["demo-sales/invoicing/invoicing-web-legacy"],
  sopsSecrets: require('../../../config/demo-sales.enc.json'),
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
