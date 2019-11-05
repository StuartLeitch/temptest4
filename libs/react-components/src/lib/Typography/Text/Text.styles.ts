import styled, {css} from 'styled-components';
import {space, typography} from 'styled-system';

import {th} from '../../Theme';
import {TextSizes, TextTypes} from './Text';
import * as fontTypes from '../fontTypes';

const textColor = ({type}: {type: TextTypes}) => {
  switch (type) {
    case 'secondary':
      return css`
        color: ${th('colors.textSecondary')};
      `;
    case 'success':
      return css`
        color: ${th('colors.actionPrimary')};
      `;
    case 'info':
      return css`
        color: ${th('colors.info')};
      `;
    case 'warning':
      return css`
        color: ${th('colors.warning')};
      `;
    case 'primary':
    default:
      return css`
        color: ${th('colors.textPrimary')};
      `;
  }
};

const textSize = ({size}: {size: TextSizes}) => {
  switch (size) {
    case 'small':
      return css`
        font-size: ${th('fontSizes.textMessage')};
      `;
    case 'normal':
    default:
      return css`
        font-size: ${th('fontSizes.textRegular')};
      `;
  }
};

export const Text = styled.span`
  line-height: ${th('fontSizes.lineHeight')};

  ${textSize};
  ${textColor};
  ${fontTypes.regular};

  ${space};
  ${typography};
`;
