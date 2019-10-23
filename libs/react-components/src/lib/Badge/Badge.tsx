import React from 'react';
import {SpaceProps} from 'styled-system';

import {Badge as Root} from './Badge.styles';

interface Props extends SpaceProps {
  inverse?: boolean;
  children?: React.ReactNode;
}

const Badge: React.FunctionComponent<Props> = ({
  children,
  inverse,
  ...rest
}) => {
  return (
    <Root inverse={inverse} {...rest}>
      {children}
    </Root>
  );
};

Badge.defaultProps = {
  inverse: false
};

export default Badge;
