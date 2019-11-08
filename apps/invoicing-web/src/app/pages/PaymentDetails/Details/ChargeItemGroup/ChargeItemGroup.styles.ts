import styled from "styled-components";
import { layout, space, flex } from "styled-system";

import { th } from "@hindawi/react-components";

export const ChargeItemGroup = styled.div`
  ${layout};
  ${space};
  ${flex};

  & > * {
    margin-bottom: calc(${th("gridUnit")} * 2);

    &:last-child {
      margin-bottom: 0;
    }
  }
`;
