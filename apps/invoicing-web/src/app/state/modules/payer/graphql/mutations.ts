import gql from "graphql-tag";
import { ASTNode } from "graphql";

export const createPayer: ASTNode = gql`
  mutation createPayer($input: string) {
    createPayer(input: $input) {
      id
      email
    }
  }
`;

export const updateInvoicePayer: ASTNode = gql`
  mutation updateInvoicePayer($payerId: String!, $payer: PayerInput!) {
    updateInvoicePayer(payerId: $payerId, payer: $payer) {
      id
      type
      name
      city
      email
      country
      billingAddress
      organization
    }
  }
`;
