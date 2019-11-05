import styled, {css, AnyStyledComponent} from 'styled-components';
import {space} from 'styled-system';

import {th, lighten} from '../Theme';

const iconButtonStyles = ({highlight}: {highlight: boolean}) => {
  if (highlight) {
    return css`
      background-color: ${th('colors.textPrimary')};

      & > * {
        fill: ${th('colors.white')};
      }
    `;
  }

  return css`
    background-color: transparent;
    & > * {
      fill: ${th('colors.textPrimary')};
    }
  `;
};

export const IconButton: AnyStyledComponent = styled.button`
  align-items: center;
  border-radius: ${th('gridUnit')};
  border: 1px solid ${th('colors.textPrimary')};
  cursor: pointer;
  display: inline-flex;
  justify-content: center;

  height: calc(${th('gridUnit')} * 8);
  width: calc(${th('gridUnit')} * 8);

  ${iconButtonStyles};
  ${space};

  &:hover {
    background-color: ${lighten('colors.textPrimary', 40)};

    & > * {
      fill: ${th('colors.white')};
    }
  }

  &:disabled {
    background-color: ${th('colors.disabled')};
    border-color: ${th('colors.disabled')};
    cursor: not-allowed;

    & > * {
      fill: ${th('colors.white')};
    }
  }
`;
