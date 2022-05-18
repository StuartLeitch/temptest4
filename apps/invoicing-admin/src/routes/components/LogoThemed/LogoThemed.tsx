import React from 'react';
import classNames from 'classnames';

const LogoThemed: React.FC<LogoThemedProps> = ({
  className,
  ...otherProps
}) => (
  <img
    src='./../../../assets/images/logos/hindawi.svg'
    className={classNames('d-block', className)}
    alt='Hindawi Logo'
    {...otherProps}
  />
);

interface LogoThemedProps {
  className?: string;
}

export { LogoThemed };
