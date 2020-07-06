import gql from "graphql-tag";
import { ASTNode } from "graphql";

export const creditCardPayment: ASTNode = gql`
  mutation creditCardPayment(
    $invoiceId: ID!
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
  mutation recordPayPalPayment($invoiceId: ID!) {
    recordPayPalPayment(invoiceId: $invoiceId) {
      id
    }
  }
`;

export const createPayPalOrder: ASTNode = gql`
  mutation createPayPalOrder($invoiceId: ID!) {
    createPayPalOrder(invoiceId: $invoiceId) {
      id
    }
  }
`;

export const bankTransferPayment: ASTNode = gql`
  mutation bankTransferPayment(
    $invoiceId: String!
    $paymentMethodId: String!
    $amount: Float!
    $paymentReference: String!
    $datePaid: String!
  ) {
    bankTransferPayment(
      invoiceId: $invoiceId
      paymentMethodId: $paymentMethodId
      paymentReference: $paymentReference
      amount: $amount
      datePaid: $datePaid
    ) {
      id
    }
  }
`;
