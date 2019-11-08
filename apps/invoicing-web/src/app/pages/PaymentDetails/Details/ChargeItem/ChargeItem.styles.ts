import styled, { AnyStyledComponent, css } from "styled-components";
import { layout, space, flex } from "styled-system";

import { th } from "@hindawi/react-components";

export const ChargeItem: AnyStyledComponent = styled.div`
  justify-content: space-between;
  align-items: flex-start;
  display: flex;

  ${layout};
  ${space};
  ${flex};

  & > * {
    margin-right: calc(${th("gridUnit")} * 4);

    &:last-child {
      margin-right: 0;
    }
  }
`;
