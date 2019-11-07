import styled, { AnyStyledComponent } from "styled-components";

import { th } from "@hindawi/react-components";

export const Charges: AnyStyledComponent = styled.section`
  & > *:first-child {
    margin-right: calc(${th("gridUnit")} * -4);
    margin-left: calc(${th("gridUnit")} * -4);
    margin-top: calc(${th("gridUnit")} * 4);
  }
`;
