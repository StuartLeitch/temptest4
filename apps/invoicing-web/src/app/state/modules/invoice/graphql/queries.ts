import gql from "graphql-tag";
import { ASTNode } from "graphql";

export const getInvoice: ASTNode = gql`
  query invoice($id: String) {
    invoice(id: $id) {
      id
    }
  }
`;
