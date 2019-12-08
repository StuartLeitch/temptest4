import gql from "graphql-tag";
import { ASTNode } from "graphql";

export const creditCardPayment: ASTNode = gql`
  mutation creditCardPayment(
    $invoiceId: String!
    $payerId: String!
    $paymentMethodId: String!
    $paymentMethodNonce: String!
    $amount: Float!
  ) {
    creditCardPayment(
      invoiceId: $invoiceId
      payerId: $payerId
      paymentMethodId: $paymentMethodId
      paymentMethodNonce: $paymentMethodNonce
      amount: $amount
    ) {
      id
    }
  }
`;

export const recordPayPalPayment: ASTNode = gql`
  mutation recordPayPalPayment(
    $paymentMethodId: String!
    $invoiceId: String!
    $payerId: String!
    $orderId: String!
  ) {
    recordPayPalPayment(
      paymentMethodId: $paymentMethodId
      invoiceId: $invoiceId
      payerId: $payerId
      orderId: $orderId
    ) {
      id
    }
  }
`;
