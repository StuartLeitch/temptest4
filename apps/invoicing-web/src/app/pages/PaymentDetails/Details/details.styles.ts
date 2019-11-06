import styled, { AnyStyledComponent } from "styled-components";

import { th } from "@hindawi/react-components";

export const Details: AnyStyledComponent = styled.div`
  margin: calc(${th("gridUnit")} * 4);
  margin-bottom: calc(${th("gridUnit")} * 5);
`;
