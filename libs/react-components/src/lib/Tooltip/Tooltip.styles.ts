import styled, { AnyStyledComponent, css } from 'styled-components';

import { TooltipDirections } from './TooltipDirections';

import { th } from '../Theme';

const yPosition = css`
  &::before,
  &::after {
    border-right: 10px solid transparent;
    border-left: 10px solid transparent;
    margin-left: -10px;
    left: 50%;
  }

  &::after {
    z-index: 1;
  }
`;

const xPosition = css`
  &::before,
  &::after {
    border-bottom: 10px solid transparent;
    border-top: 10px solid transparent;
    margin-top: -10px;
    top: 50%;
  }

  &::after {
    z-index: 1;
  }
`;

const right = css`
  ${xPosition}

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
  ${xPosition}

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
  ${yPosition}

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
  ${yPosition}

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

const position = ({ position }: { position: TooltipDirections }) => {
  switch (position) {
    case 'bottom':
      return bottom;
    case 'right':
      return right;
    case 'left':
      return left;
    case 'top':
      return top;
    default:
      return bottom;
  }
};

const moveWithScroll = ({ left, top }: { left: string; top: string }) => {
  return css`
    left: ${left + window.scrollX}px;
    top: ${top + window.scrollY}px;
  `;
};

export const Tooltip: AnyStyledComponent = styled.div`
  max-width: calc(${th('gridUnit')} * 65);
  padding: calc(${th('gridUnit')} * 2);
  position: absolute;
  left: 0%;

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

  ${moveWithScroll};
  ${position};
`;
