import gql from "graphql-tag";
import { ASTNode } from "graphql";

export const creditCardPayment: ASTNode = gql`
  mutation creditCardPayment(
    $invoiceId: String!
    $payerId: String!
    $paymentMethodId: String!
    $creditCard: CreditCardInput!
  ) {
    creditCardPayment(
      invoiceId: $invoiceId
      payerId: $payerId
      paymentMethodId: $paymentMethodId
      creditCard: $creditCard
    ) {
      id
    }
  }
`;
