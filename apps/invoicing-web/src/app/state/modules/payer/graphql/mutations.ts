import gql from "graphql-tag";
import { ASTNode } from "graphql";

export const createPayer: ASTNode = gql`
  mutation createPayer($input: string) {
    createPayer(input: $input) {
      id
      email
    }
  }
`;
