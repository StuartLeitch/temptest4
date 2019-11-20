import gql from "graphql-tag";
import { ASTNode } from "graphql";

import { invoiceFragment } from "./fragments";

export const getInvoice: ASTNode = gql`
  query invoice($id: String) {
    invoice(invoiceId: $id) {
      ...invoiceFragment
    }
  }
  ${invoiceFragment}
`;

export const getInvoices: ASTNode = gql`
  query fetchInvoices {
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
`;
