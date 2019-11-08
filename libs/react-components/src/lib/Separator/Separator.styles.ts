import styled, {AnyStyledComponent, css} from 'styled-components';
import {layout, space, flex} from 'styled-system';

import {th} from '../Theme';

import {SeparatorDirection, SeparatorFraction} from './SeparatorTypes';

const separatorDirection = ({
  direction,
  fraction
}: {
  direction: SeparatorDirection;
  fraction: SeparatorFraction;
}) => {
  switch (direction) {
    case 'vertical':
      return css`
        border-right-width: 1px;
        height: ${fraction}%;
      `;
    case 'horizontal':
      return css`
        border-bottom-width: 1px;
        width: ${fraction}%;
      `;
    default:
      return css``;
  }
};

export const Separator: AnyStyledComponent = styled.div`
  border-color: ${th('colors.furniture')};
  box-sizing: border-box;
  border-style: solid;
  border-width: 0;

  ${separatorDirection}
  ${layout};
  ${space};
  ${flex};
`;
