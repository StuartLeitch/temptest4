import styled, { AnyStyledComponent } from "styled-components";

import { th } from "@hindawi/react-components";

export const ChargeItem: AnyStyledComponent = styled.div`
  justify-content: space-between;
  align-items: flex-start;
  display: flex;

  & > :first-child {
    margin-right: calc(${th("gridUnit")} * 4);
  }
`;
