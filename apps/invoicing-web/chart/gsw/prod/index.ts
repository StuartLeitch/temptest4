import {
  WithAwsSecretsServiceProps,
  IngressOptionsSpec,
} from "@hindawi/phenom-charts";
import { defaultValues } from "../../default";

const values: WithAwsSecretsServiceProps = {
  ...defaultValues,
  secretNames: ["gsw-prod/invoicing/invoicing-web-legacy"],
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
