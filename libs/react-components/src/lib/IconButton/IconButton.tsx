import React from 'react';
import {SpaceProps} from 'styled-system';

import Icon, {IconNames} from '../Icon';
import {IconButton as Root} from './IconButton.styles';

export interface Props extends SpaceProps {
  highlight?: boolean;
  disabled?: boolean;
  name?: IconNames;
  label?: string;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

const IconButton: React.FunctionComponent<Props> = ({
  name,
  label,
  onClick,
  ...rest
}) => {
  return (
    <Root aria-label={label} role="button" onClick={onClick} {...rest}>
      <Icon name={name} />
    </Root>
  );
};

IconButton.defaultProps = {
  label: 'Icon button'
};

export default IconButton;
