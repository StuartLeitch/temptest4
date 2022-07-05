import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ["prod/invoicing/invoicing-web-legacy"],
  sopsSecrets: require('../../../config/prod.enc.json'),
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
