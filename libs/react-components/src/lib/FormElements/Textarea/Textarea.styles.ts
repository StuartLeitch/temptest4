import styled, { AnyStyledComponent } from 'styled-components';

import { TextArea } from '../CommonStyles';

export const Textarea: AnyStyledComponent = styled(TextArea)`
  resize: ${({ resize }) => resize};
`;
