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
  background-color: ${th('colors.background')};
  position: absolute;
  left: 0px;
  top: 0px;
  text-align: left;
  text-align: start;
  text-shadow: none;
  text-transform: none;
  white-space: normal;
  word-break: normal;
  word-spacing: normal;
  word-wrap: normal;
  border: 1px solid ${th('colors.disabled')};

  display: inline-block;

  &.right {
    margin-left: 5px;
  }

  &.left {
    margin-left: -5px;
  }

  &.top {
    margin-top: -5px;
  }

  &.bottom {
    margin-top: 5px;
  }

  .tooltip-arrow {
    top: 50%;
    left: 0;
    margin-top: -5px;
    border-width: 5px 5px 5px 0;
    border-right-color: ${th('colors.disabled')};
  }

  &.right .tooltip-arrow {
    top: 50%;
    left: auto;
    margin-left: -5px;
    border-width: 5px 5px 5px 0;
    border-right-color: ${th('colors.disabled')};
  }

  &.top .tooltip-arrow {
    top: auto;
    bottom: -5px;
    left: 50%;
    margin-left: -5px;
    border-width: 5px 5px 0;
    border-top-color: ${th('colors.disabled')};
  }

  &.left .tooltip-arrow {
    top: 50%;
    margin-top: -5px;
    border-width: 5px 0 5px 5px;
    border-left-color: ${th('colors.disabled')};
    right: -5px;
    left: auto;
  }

  &.bottom .tooltip-arrow {
    top: 0;
    left: 50%;
    margin-left: -5px;
    border-width: 0 5px 5px;
    border-bottom-color: ${th('colors.disabled')};
  }

  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-color: transparent;
    border-right-color: transparent;
    border-style: solid;
  }

  .tooltip-text {
    max-width: 200px;
    padding: calc(${th('gridUnit')} * 2);
    text-align: center;
    border-radius: ${th('gridUnit')};
    font-family: Nunito;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
  }

  ${positionXY};
`;
