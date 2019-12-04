import React from 'react';

import { TooltipDirections } from './TooltipDirections';

import { Tooltip as Root } from './Tooltip.styles';

interface Props {
  direction?: TooltipDirections;
  message: string;
  left?: string;
  top?: string;
}

const Tooltip: React.FC<Props> = ({ message, ...rest }) => (
  <Root {...rest}>{message}</Root>
);

Tooltip.defaultProps = {
  direction: 'bottom',
  left: '0',
  top: '0'
};

export default Tooltip;
