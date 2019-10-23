import styled, {css, AnyStyledComponent} from 'styled-components';
import {space} from 'styled-system';

import {bold} from '../Typography';
import {th} from '../Theme';

const badgeStyles = ({inverse}: {inverse: boolean}) => {
  if (inverse) {
    return css`
      border: 1px solid ${th('colors.disabled')};
      background-color: ${th('colors.transparent')};
      color: ${th('colors.textPrimary')};
    `;
  }
  return css`
    background-color: ${th('colors.textPrimary')};
    color: ${th('colors.white')};
  `;
};

export const Badge: AnyStyledComponent = styled.span`
  align-items: center;
  border-radius: ${th('gridUnit')};
  display: inline-flex;
  justify-content: center;
  font-size: ${th('fontSizes.labelSmall')};
  line-height: ${th('fontSizes.lineHeight')};
  padding: ${th('gridUnit')};

  ${bold};
  ${badgeStyles};
  ${space};
`;
