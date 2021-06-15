import gql from "graphql-tag";
import { ASTNode } from "graphql";

import { invoiceFragment, invoiceVatFragment } from "./fragments";

export const getInvoice: ASTNode = gql`
  query invoice($id: ID) {
    invoice(invoiceId: $id) {
      ...invoiceFragment
    }
  }
  ${invoiceFragment}
`;

export const getInvoiceVat: ASTNode = gql`
  query invoiceWithVat(
    $invoiceId: ID
    $country: String
    $payerType: String
    $state: String
    $postalCode: String
  ) {
    invoiceVat(
      invoiceId: $invoiceId
      country: $country
      payerType: $payerType
      state: $state
      postalCode: $postalCode
    ) {
      ...invoiceVatFragment
    }
  }
  ${invoiceVatFragment}
`;
