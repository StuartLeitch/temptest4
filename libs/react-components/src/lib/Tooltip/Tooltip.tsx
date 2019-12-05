import React, { ReactElement, Fragment, FC } from 'react';

import { TooltipDirections } from './TooltipDirections';

import { Tooltip as Root } from './Tooltip.styles';

interface Props {
  position?: TooltipDirections;
  children?: ReactElement;
  message: string;
  left?: string;
  top?: string;
}

const Tooltip: FC<Props> = ({ message, children, ...rest }) => (
  <Fragment>
    <Root {...rest}>{message}</Root>
    {children}
  </Fragment>
);

Tooltip.defaultProps = {
  position: 'bottom',
  left: '0',
  top: '0'
};

export default Tooltip;
