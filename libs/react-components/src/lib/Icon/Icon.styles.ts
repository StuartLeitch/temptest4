import styled, {css} from 'styled-components';
import {space} from 'styled-system';
import {th} from '../Theme';

const iconSize = ({size}: {size: number}) => css`
  width: calc(${th('gridUnit')} * ${size});
  height: calc(${th('gridUnit')} * ${size});
`;

export const Icon = styled.svg`
  fill: ${({color}: {color: string}) => th(color)};

  ${iconSize};
  ${space};
`;
