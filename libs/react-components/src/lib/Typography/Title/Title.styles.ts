import {capitalize} from 'lodash';
import styled, {css} from 'styled-components';
import {space, typography} from 'styled-system';

import {th} from '../../Theme';
import * as fontTypes from '../fontTypes';
import {Titles, Color} from './TitleTypes';

const fontSize = ({type}: {type: Titles}) => {
  return css`
    font-size: ${th(`fontSizes.title${capitalize(type)}`)};
  `;
};

const ellipsis = ({ellipsis}: {ellipsis: boolean}) => {
  if (ellipsis) {
    return css`
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    `;
  }
};

const setColor = ({color}: {color: Color}) => {
  switch (color) {
    case 'light':
      return css`
        color: ${th('colors.textPrimary')};
      `;
    case 'dark':
      return css`
        color: ${th('colors.white')};
      `;
    default:
      return css``;
  }
};

export const Title = styled.h1`
  line-height: 1.3;
  margin-block-end: 0;
  margin-block-start: 0;
  text-transform: ${({upper}: {upper: boolean}) =>
    upper ? 'uppercase' : 'none'};

  ${ellipsis};
  ${fontSize};
  ${fontTypes.bold};
  ${space};
  ${typography};
  ${setColor};
`;
