import React from 'react';
import {FlexboxProps, SpaceProps} from 'styled-system';

import {TextButton as Root} from './TextButton.styles';

export interface Props extends FlexboxProps, SpaceProps {
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

const TextButton: React.FunctionComponent<Props> = ({
  children,
  onClick,
  ...rest
}) => {
  return (
    <Root onClick={onClick} {...rest}>
      {children}
    </Root>
  );
};

export default TextButton;
