import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ["demo/invoicing/invoicing-web-legacy"],
  sopsSecrets: require('../../../config/demo.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
    ingressOptions: {
      rules: [
        {
          host: "invoicing-web.demo.phenom.pub",
        },
      ],
    },
  },
};

export { values };
