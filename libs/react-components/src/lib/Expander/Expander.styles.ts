import {space, layout} from 'styled-system';
import styled, {AnyStyledComponent} from 'styled-components';

import {th} from '../Theme';
import {regular} from '../Typography/fontTypes';

export const Expander: AnyStyledComponent = styled.section`
  border: 1px solid ${th('colors.furniture')};
  background-color: ${th('colors.white')};
  border-radius: 6px;

  ${regular};
  ${layout};
  ${space};
`;
