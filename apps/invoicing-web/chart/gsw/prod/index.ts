import {
  WithSopsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithSopsSecretsServiceProps = {
  ...defaultValues,
  // secretNames: ["gsw-prod/invoicing/invoicing-web-legacy"],
  sopsSecrets: require('../../../config/gsw-prod.enc.json'),
  serviceProps: {
    ...defaultValues.serviceProps,
    envVars: {},
    ingressOptions: {
      rules: [
        {
          host: "invoicing-web.gsw-prod.phenom.pub",
        },
        {
          host: "invoicing.lithosphere.geoscienceworld.org",
        },
      ],
    },
  },
};

export { values };
