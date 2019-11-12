import gql from "graphql-tag";
import { ASTNode } from "graphql";

import { invoiceFragment } from "./fragments";

export const getInvoice: ASTNode = gql`
  query invoice($id: String) {
    invoice(id: $id) {
      ...invoiceFragment
    }
  }
  ${invoiceFragment}
`;
