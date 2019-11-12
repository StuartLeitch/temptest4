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

export const confirmInvoice: ASTNode = gql`
  mutation confirmInvoice($payerId: String!, $payer: PayerInput!) {
    confirmInvoice(payerId: $payerId, payer: $payer) {
      id
      type
      name
      email
      organization
    }
  }
`;
