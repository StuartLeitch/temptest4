import gql from "graphql-tag";
import { ASTNode } from "graphql";

import { payerFragment, couponFragment } from "./fragments";

export const createPayer: ASTNode = gql`
  mutation createPayer($input: string) {
    createPayer(input: $input) {
      id
      email
    }
  }
`;

export const confirmInvoice: ASTNode = gql`
  mutation confirmInvoice($payer: PayerInput!) {
    confirmInvoice(payer: $payer) {
      ...payerFragment
    }
  }
  ${payerFragment}
`;

export const applyCoupon: ASTNode = gql`
  mutation applyCoupon($invoiceId: ID, $couponCode: String) {
    applyCoupon(invoiceId: $invoiceId, couponCode: $couponCode) {
      ...couponFragment
    }
  }
  ${couponFragment}
`;
