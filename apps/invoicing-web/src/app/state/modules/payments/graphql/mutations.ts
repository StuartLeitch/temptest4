import gql from "graphql-tag";
import { ASTNode } from "graphql";

export const creditCardPayment: ASTNode = gql`
  mutation creditCardPayment(
    $invoiceId: String!
    $paymentMethodId: String!
    $creditCard: CreditCardInput!
  ) {
    creditCardPayment(
      invoiceId: $invoiceId
      paymentMethodId: $paymentMethodId
      creditCard: $creditCard
    ) {
      id
    }
  }
`;
