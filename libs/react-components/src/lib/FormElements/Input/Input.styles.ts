import styled, {css, AnyStyledComponent} from 'styled-components';
import {space, layout} from 'styled-system';

import {th, lighten, Theme} from '../../Theme';
import {regular, regularItalic} from '../../Typography';

import {InputStatus} from './Input';

const statusColor = ({status}: {status: InputStatus}) => {
  switch (status) {
    case 'warning':
      return css`
        border-color: ${lighten('colors.warning', 30)};

        &:hover {
          border-color: ${lighten('colors.warning', 10)};
        }

        &:focus,
        &:active {
          border-color: ${th('colors.warning')};
        }
      `;
    case 'info':
      return css`
        border-color: ${lighten('colors.info', 30)};

        &:hover {
          border-color: ${lighten('colors.info', 10)};
        }

        &:focus,
        &:active {
          border-color: ${th('colors.info')};
        }
      `;
    case 'success':
      return css`
        border-color: ${lighten('colors.actionPrimary', 30)};

        &:hover {
          border-color: ${lighten('colors.actionPrimary', 10)};
        }

        &:focus,
        &:active {
          border-color: ${th('colors.actionPrimary')};
        }
      `;
    case 'none':
    default:
      return css`
        border-color: ${th('colors.disabled')};

        &:hover {
          border-color: ${lighten('colors.textPrimary', 60)};
        }

        &:focus,
        &:active {
          border-color: ${th('colors.textPrimary')};
        }
      `;
  }
};

export const Container = styled.div`
  align-items: center;
  box-sizing: border-box;
  border: 1px solid;
  border-radius: ${th('gridUnit')};
  display: inline-flex;
  height: calc(${th('gridUnit')} * 8);
  padding: 0 calc(${th('gridUnit')} * 2);
  width: calc(${th('gridUnit')} * 40);

  ${statusColor};
  ${space};
  ${layout};
`;

export const Input: AnyStyledComponent = styled.input`
  border: none;
  font-size: ${th('fontSizes.textRegular')};
  line-height: ${th('fontSizes.lineHeight')};
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${lighten('colors.textPrimary', 60)};
    ${regularItalic};
  }

  ${regular};
`;
