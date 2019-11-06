import React from 'react';
import {SpaceProps, LayoutProps, FlexboxProps} from 'styled-system';

import {ActionLink as Root} from './action-link.styles';

type ActionType = 'action' | 'link';

export interface Props extends SpaceProps, LayoutProps, FlexboxProps {
  children?: React.ReactNode;
  type?: ActionType;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

const ActionLink: React.FC<Props> = ({children, onClick, ...rest}) => {
  return (
    <Root onClick={onClick} {...rest}>
      {children}
    </Root>
  );
};

export default ActionLink;
