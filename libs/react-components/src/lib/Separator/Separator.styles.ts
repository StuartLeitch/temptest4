import styled, {AnyStyledComponent, css} from 'styled-components';
import {layout, space, flex} from 'styled-system';

import {th} from '../Theme';

import {SeparatorDirection} from './SeparatorTypes';

const direction = ({direction}: {direction: SeparatorDirection}) => {
  switch (direction) {
    case 'vertical':
      return css`
        border-right-width: 1px;
      `;
    case 'horizontal':
      return css`
        border-bottom-width: 1px;
      `;
    default:
      return css``;
  }
};

export const Separator: AnyStyledComponent = styled.div`
  border-color: ${th('colors.furniture')};
  border-style: solid;
  height: 100%;

  ${direction}
  ${layout};
  ${space};
  ${flex};
`;
