import gql from "graphql-tag";

export const paymentMethodFragment = gql`
  fragment paymentMethodFragment on PaymentMethod {
    id
    name
    isActive
  }
`;
