import React from 'react';
import {SpaceProps, LayoutProps, FlexboxProps} from 'styled-system';

import {ExpansionTitle as Root} from './ExpansionTitle.styles';
import Icon from '../../Icon';
import Title from '../../Typography/Title';

export interface Props extends SpaceProps, LayoutProps, FlexboxProps {
  expanded: boolean;
  title: string;
  iconSize?: number;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

const iconName = (state: boolean) => {
  return state ? 'collapse' : 'expand';
};

const ExpansionTitle: React.FunctionComponent<Props> = ({
  title,
  onClick,
  expanded,
  iconSize,
  ...rest
}) => {
  return (
    <Root {...rest} onClick={onClick}>
      <Icon
        color="colors.actionSecondary"
        name={iconName(expanded)}
        size={iconSize}
      />
      <Title type="small">{title}</Title>
    </Root>
  );
};

ExpansionTitle.defaultProps = {
  expanded: false,
  title: ''
};

export default ExpansionTitle;
