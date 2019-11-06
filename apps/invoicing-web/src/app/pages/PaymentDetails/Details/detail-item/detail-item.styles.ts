import styled, { AnyStyledComponent } from "styled-components";

import { th } from "@hindawi/react-components";

export const DetailItem: AnyStyledComponent = styled.div`
  margin-bottom: calc(${th("gridUnit")} * 2);
`;
