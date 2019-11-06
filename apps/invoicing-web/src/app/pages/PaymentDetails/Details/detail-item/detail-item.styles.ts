import styled, { AnyStyledComponent } from "styled-components";

import { th } from "@hindawi/react-components";

export const DetailItem: AnyStyledComponent = styled.div`
  margin-bottom: calc(${th("gridUnit")} * 2);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;

  & > * {
    margin-right: calc(${th("gridUnit")} * 4);
  }

  &:last-child {
    margin-right: 0;
  }
`;
