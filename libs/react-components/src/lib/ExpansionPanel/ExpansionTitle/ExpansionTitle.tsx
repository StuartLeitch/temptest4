import React, {ReactNode, useState} from 'react';
import {SpaceProps, LayoutProps, FlexboxProps} from 'styled-system';

import {ExpansionTitle as Root} from './ExpansionTitle.styles';
import Icon from '../../Icon';
import Title from '../../Typography/Title';

export interface Props extends SpaceProps, LayoutProps, FlexboxProps {
  expanded: boolean;
  title: string;
  onClick(e: React.MouseEvent): void;
}

const iconName = (state: boolean) => {
  return state ? 'collapse' : 'expand';
};

const ExpansionTitle: React.FunctionComponent<Props> = ({
  expanded,
  onClick,
  title,
  ...rest
}) => {
  return (
    <Root {...rest}>
      <Icon
        color="colors.actionSecondary"
        name={iconName(expanded)}
        onClick={e => onClick(e)}
      ></Icon>
      <Title type="small">{title}</Title>
    </Root>
  );
};

ExpansionTitle.defaultProps = {
  expanded: false,
  title: ''
};

export default ExpansionTitle;
