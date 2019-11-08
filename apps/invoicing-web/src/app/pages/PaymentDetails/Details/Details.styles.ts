import styled, { AnyStyledComponent } from "styled-components";

import { th } from "@hindawi/react-components";

export const Details: AnyStyledComponent = styled.div`
  box-shadow: 3px 3px 6px rgba(141, 141, 141, 0.195588);
  background-color: ${th("colors.white")};
  padding: calc(${th("gridUnit")} * 4);
  padding-bottom: calc(${th("gridUnit")} * 8);
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  border-radius: 6px;
  display: flex;
  flex: 1;

  & > * {
    margin-bottom: calc(${th("gridUnit")} * 4);
    width: 100%;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;
