import styled, { AnyStyledComponent } from "styled-components";

import { th } from "@hindawi/react-components";

export const Details: AnyStyledComponent = styled.div`
  & > * {
    margin-bottom: calc(${th("gridUnit")} * 4);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;
