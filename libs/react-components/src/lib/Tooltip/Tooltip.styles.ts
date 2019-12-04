import styled, { AnyStyledComponent, css } from 'styled-components';
import { layout, space, flex } from 'styled-system';

import { TooltipDirections } from './TooltipDirections';

import { th } from '../Theme';

const yDirection = css`
  &::before,
  &::after {
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 50%;
    margin-left: -10px;
  }

  &::after {
    z-index: 1;
  }
`;

const xDirection = css`
  &::before,
  &::after {
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    top: 50%;
    margin-top: -10px;
  }

  &::after {
    z-index: 1;
  }
`;

const right = css`
  ${xDirection}

  &::before,
  &::after {
    left: -10px;
  }

  &::before {
    border-right: 10px solid ${th('colors.disabled')};
  }

  &::after {
    border-right: 10px solid ${th('colors.background')};
    margin-left: 2px;
  }
`;

const left = css`
  ${xDirection}

  &::before,
  &::after {
    left: 100%;
  }

  &::before {
    border-left: 10px solid ${th('colors.disabled')};
  }

  &::after {
    border-left: 10px solid ${th('colors.background')};
    margin-left: -2px;
  }
`;

const bottom = css`
  ${yDirection}

  &::before,
  &::after {
    top: -10px;
  }

  &::before {
    border-bottom: 10px solid ${th('colors.disabled')};
  }

  &::after {
    border-bottom: 10px solid ${th('colors.background')};
    margin-top: 2px;
  }
`;

const top = css`
  ${yDirection}

  &::before,
  &::after {
    top: 100%;
  }

  &::before {
    border-top: 10px solid ${th('colors.disabled')};
  }

  &::after {
    border-top: 10px solid ${th('colors.background')};
    margin-top: -2px;
  }
`;

const direction = ({ direction }: { direction: TooltipDirections }) => {
  switch (direction) {
    case 'top':
      return top;
    case 'bottom':
      return bottom;
    case 'left':
      return left;
    case 'right':
      return right;
    default:
      return bottom;
  }
};

const positionXY = ({ left, top }: { left: string; top: string }) => {
  return css`
    left: ${left + window.scrollX}px;
    top: ${top + window.scrollY}px;
  `;
};

export const Tooltip: AnyStyledComponent = styled.div`
  padding: calc(${th('gridUnit')} * 2);
  position: absolute;
  left: 0%;
  /* bottom: 100%; */
  /* margin-bottom: 15px; */

  background-color: ${th('colors.background')};
  border: 1px solid ${th('colors.disabled')};
  border-radius: ${th('gridUnit')};

  color: ${th('colors.textPrimary')};
  text-align: left;
  font-family: Nunito;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;

  &::before,
  &::after {
    content: '';
    position: absolute;
  }

  ${positionXY};
  ${direction};
`;
