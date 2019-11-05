import styled from 'styled-components';
import {space, flexbox} from 'styled-system';

import {th, lighten} from '../Theme';

export const TextButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${th('colors.actionSecondary')};
  display: flex;
  line-height: ${th('fontSizes.lineHeight')};
  font-family: ${th('fontFamily')};
  font-style: normal;
  font-size: ${th('fontSizes.textRegular')};
  font-weight: 600;
  justify-content: center;

  & > * {
    fill: ${th('colors.actionSecondary')};
  }

  &:hover {
    color: ${lighten('colors.actionSecondary', 20)};

    & > * {
      fill: ${lighten('colors.actionSecondary', 20)};
    }
  }

  &:disabled {
    color: ${th('colors.disabled')};
    cursor: not-allowed;

    & > * {
      fill: ${th('colors.disabled')};
    }
  }

  ${space};
  ${flexbox};
`;
