import {FlexboxProps, LayoutProps, SpaceProps} from 'styled-system';
import React from 'react';

import {ActionType} from './ActionLinkTypes';

import {ActionLink as Root} from './ActionLink.styles';

export interface Props extends FlexboxProps, LayoutProps, SpaceProps {
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
