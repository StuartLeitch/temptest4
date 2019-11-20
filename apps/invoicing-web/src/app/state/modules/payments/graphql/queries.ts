import gql from "graphql-tag";

import { paymentMethodFragment } from "./fragments";

export const getPaymentMethods = gql`
  query {
    getPaymentMethods {
      ...paymentMethodFragment
    }
  }
  ${paymentMethodFragment}
`;
