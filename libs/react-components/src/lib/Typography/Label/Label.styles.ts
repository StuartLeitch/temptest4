import styled, {css} from 'styled-components';
import {space} from 'styled-system';

import {th} from '../../Theme';
import {LabelTypes} from './Label';
import * as fontTypes from '../fontTypes';

const labelColor = ({type}: {type: LabelTypes}) => {
  switch (type) {
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
    case 'regular':
    default:
      return css`
        color: ${th('colors.textPrimary')};
      `;
  }
};

export const Label = styled.label`
  font-size: ${th('fontSizes.labelRegular')};
  line-height: ${th('fontSizes.lineHeight')};

  ${labelColor};
  ${fontTypes.bold};
  ${space};

  &::after {
    content: ${({required}) => (required ? '"*"' : '')};
    color: ${th('colors.warning')};
  }
`;
