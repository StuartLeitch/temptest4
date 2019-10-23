import styled, {AnyStyledComponent} from 'styled-components';

import {Input} from '../CommonStyles';

export const Textarea: AnyStyledComponent = styled(Input)`
  resize: ${({resize}) => resize};
`;
