import React, { useRef, useEffect, useState } from 'react';
import { SpaceProps, LayoutProps, FlexboxProps } from 'styled-system';

import { Button as Root } from './Button.styles';
import Loader from '../Loader';

type ButtonSizes = 'large' | 'medium' | 'small';
type ButtonTypes = 'primary' | 'secondary' | 'outline';

export interface Props extends SpaceProps, LayoutProps, FlexboxProps {
  size?: ButtonSizes;
  type?: ButtonTypes;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  onClick(
    e: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLElement>
  ): void;
}

const Button: React.FunctionComponent<Props> = ({
  children,
  onClick,
  disabled,
  loading,
  ...rest
}) => {
  const [btnWidth, setWidth] = useState(null);
  const btnRef: React.MutableRefObject<HTMLElement> = useRef();

  useEffect(() => {
    setWidth(btnRef.current.clientWidth);
  }, []);

  return (
    <Root
      ref={btnRef}
      role='button'
      minWidth={btnWidth}
      disabled={disabled}
      onClick={loading ? null : onClick}
      {...rest}
    >
      {!disabled && loading ? <Loader size={4} /> : children}
    </Root>
  );
};

Button.defaultProps = {
  size: 'large',
  loading: false,
  type: 'primary',
  disabled: false
};

export default Button;
