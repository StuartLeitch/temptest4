import gql from "graphql-tag";

export const getPaymentMethods = gql`
  query {
    getPaymentMethods {
      id
      name
      active
    }
  }
`;
