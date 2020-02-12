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

export const getInvoices: ASTNode = gql`
  query fetchInvoices($offset: Int, $limit: Int) {
    invoices(offset: $offset, limit: $limit) {
      totalCount
      invoices {
        id: invoiceId
        status
        manuscriptTitle: title
        type
        price
        customId
        dateCreated
      }
    }
  }
`;

export const getInvoiceVat: ASTNode = gql`
  query invoiceWithVat(
    $invoiceId: String
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
