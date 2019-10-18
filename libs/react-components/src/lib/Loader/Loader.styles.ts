import styled, {css} from 'styled-components';
import {space} from 'styled-system';

import {th} from '../Theme';

const iconSize = ({size}: {size: number}) => css`
  width: calc(${th('gridUnit')} * ${size});
  height: calc(${th('gridUnit')} * ${size});
`;

export const Loader = styled.div`
  border-radius: 100%;
  display: flex;
  position: relative;
  margin-bottom: ${th('gridUnit')};
  :before,
  :after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 100%;
  }
  :before {
    animation: spin 1s infinite;
    border: calc(${th('gridUnit')} / 2) solid ${th('colors.furniture')};
    border-top-color: ${th('colors.actionPrimary')};
    z-index: 1;
  }
  :after {
    border: calc(${th('gridUnit')} / 2) solid ${th('colors.actionPrimary')};
  }
  @keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  ${iconSize};
  ${space};
`;
