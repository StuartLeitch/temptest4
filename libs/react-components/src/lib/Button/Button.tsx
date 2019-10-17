import React, {useRef, useEffect, useState} from 'react';
import {SpaceProps, LayoutProps} from 'styled-system';

import {Button as Root} from './Button.styles';
import Loader from '../Loader';

type ButtonSizes = 'large' | 'medium' | 'small';
type ButtonTypes = 'primary' | 'secondary' | 'outline';

export interface Props extends SpaceProps, LayoutProps {
  size?: ButtonSizes;
  type?: ButtonTypes;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
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
      minWidth={btnWidth}
      disabled={disabled}
      onClick={loading ? null : onClick}
      {...rest}
    >
      {!disabled && loading ? (
        <Loader />
      ) : (
        React.Children.map(children, c => {
          if (!React.isValidElement(c)) {
            return c;
          }
          return React.cloneElement(c, {disabled});
        })
      )}
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
