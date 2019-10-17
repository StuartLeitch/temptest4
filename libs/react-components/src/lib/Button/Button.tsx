import * as React from 'react';
import {SpaceProps} from 'styled-system';

import {Button as Root} from './Button.styles';

type ButtonSizes = 'large' | 'medium' | 'small';
type ButtonTypes = 'primary' | 'secondary' | 'outline';

export interface Props extends SpaceProps {
  size?: ButtonSizes;
  type?: ButtonTypes;
  children?: React.ReactNode;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

const Button: React.FunctionComponent<Props> = ({
  children,
  onClick,
  ...rest
}) => (
  <Root onClick={onClick} {...rest}>
    {children}
  </Root>
);

Button.defaultProps = {
  type: 'primary',
  size: 'large'
};

export default Button;
