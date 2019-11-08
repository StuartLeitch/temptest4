import {capitalize} from 'lodash';
import styled, {css} from 'styled-components';
import {space, typography} from 'styled-system';

import {th} from '../../Theme';
import {Titles} from './Title';
import * as fontTypes from '../fontTypes';

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

export const Title = styled.h1`
  color: ${th('colors.textPrimary')};
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
`;
