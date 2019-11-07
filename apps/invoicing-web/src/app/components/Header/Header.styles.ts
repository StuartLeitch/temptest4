import styled, { AnyStyledComponent } from "styled-components";

import { th } from "@hindawi/react-components";

export const Header: AnyStyledComponent = styled.header`
  padding: calc(${th("gridUnit")} * 4) calc(${th("gridUnit")} * 5);
  background-color: ${th("colors.white")};
  display: flex;
`;
