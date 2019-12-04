import React from 'react';

import Text from '../Typography/Text/Text';

import { Tooltip as Root } from './Tooltip.styles';

interface Props {
  message: string;
  left?: string;
  top?: string;
}

const Tooltip: React.FC<Props> = ({ message, ...rest }) => (
  <Root {...rest}>
    <div className='tooltip-arrow' />
    <div className='tooltip-text'>{message}</div>
  </Root>
);

Tooltip.defaultProps = {
  left: '0',
  top: '0'
};

export default Tooltip;
