import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ["gsw-demo/invoicing/invoicing-web-legacy"],
  sopsSecrets: require('../../../config/gsw-demo.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
    ingressOptions: {
      rules: [
        {
          host: "invoicing-web.demo-gsw.phenom.pub",
        },
      ],
    },
  },
};

export { values };
