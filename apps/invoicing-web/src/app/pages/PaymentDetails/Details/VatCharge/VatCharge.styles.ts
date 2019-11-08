import styled from "styled-components";
import { layout, space, flex } from "styled-system";

import { th } from "@hindawi/react-components";

export const VatCharge = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  ${layout};
  ${space};
  ${flex};
`;
