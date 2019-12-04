import styled, { AnyStyledComponent, css } from 'styled-components';
import { layout, space, flex } from 'styled-system';

import { th } from '../Theme';

const positionXY = ({ left, top }) => {
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
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    top: 100%;
    left: 50%;
    margin-left: -10px;
  }

  &::before {
    border-top: 10px solid ${th('colors.disabled')};
  }

  /* The white fill of the triangle */
  &::after {
    border-top: 10px solid ${th('colors.background')};
    margin-top: -2px;
    z-index: 1;
  }

  ${positionXY};
`;
