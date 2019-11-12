import gql from "graphql-tag";

export const addressFragment = gql`
  fragment addressFragment on Address {
    city
    country
    addressLine1
  }
`;

export const payerFragment = gql`
  fragment payerFragment on Payer {
    id
    type
    name
    email
    organization
    address {
      ...addressFragment
    }
  }
  ${addressFragment}
`;

export const invoiceFragment = gql`
  fragment invoiceFragment on Invoice {
    id
    status
    payer {
      ...payerFragment
    }
  }
  ${payerFragment}
`;
