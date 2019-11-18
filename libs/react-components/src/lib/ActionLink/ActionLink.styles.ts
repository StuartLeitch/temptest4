import styled, {AnyStyledComponent, css} from 'styled-components';
import {space} from 'styled-system';

import {th, lighten} from '../Theme';
import {semibold, bold, regular} from '../Typography/fontTypes';

import {ActionType} from './ActionLinkTypes';

const linkType = ({type}: {type: ActionType}) => {
  switch (type) {
    case 'action':
      return css`
        ${bold}
      `;
    case 'link':
      return css`
        ${semibold}
      `;
    default:
      return css``;
  }
};

export const ActionLink: AnyStyledComponent = styled.a`
  color: ${th('colors.actionSecondary')};
  line-height: 18px;
  font-size: 13px;

  ${linkType};
  ${regular};
  ${space};

  &:hover {
    color: ${lighten('colors.actionSecondary', 10)};
    cursor: pointer;
  }
`;
