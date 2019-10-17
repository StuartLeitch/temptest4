import styled, {css} from 'styled-components';
import {space} from 'styled-system';
import {th} from '../Theme';

const iconSize = ({size}: {size: number}) => css`
  width: calc(${th('gridUnit')} * ${size});
  height: calc(${th('gridUnit')} * ${size});
`;

export const Icon = styled.svg`
  & path {
    fill: ${({color, disabled}: {color: string; disabled: boolean}) =>
      disabled ? th('colors.white') : th(color)};
  }

  ${iconSize};
  ${space};
`;
