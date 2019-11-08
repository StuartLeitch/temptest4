import styled, {AnyStyledComponent} from 'styled-components';
import {layout, space, flex} from 'styled-system';

import {th} from '../Theme';
import {regular} from '../Typography/fontTypes';

export const Expander: AnyStyledComponent = styled.section`
  border: 1px solid ${th('colors.furniture')};
  background-color: ${th('colors.white')};
  border-radius: ${th('gridUnit')};

  align-self: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;

  ${regular};
  ${layout};
  ${space};
  ${flex};
`;
