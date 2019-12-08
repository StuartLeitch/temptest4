import gql from "graphql-tag";

import { paymentMethodFragment, clientTokenFragment } from "./fragments";

export const getPaymentMethods = gql`
  query {
    getPaymentMethods {
      ...paymentMethodFragment
    }
  }
  ${paymentMethodFragment}
`;

export const getClientToken = gql`
  query {
    getClientToken {
      ...clientTokenFragment
    }
  }
  ${clientTokenFragment}
`;
