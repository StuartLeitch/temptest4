import React from 'react';
import {SpaceProps, LayoutProps, FlexboxProps} from 'styled-system';

import {ExpansionTitle as Root} from './ExpansionTitle.styles';
import Icon from '../../Icon';
import Title from '../../Typography/Title';

export interface Props extends SpaceProps, LayoutProps, FlexboxProps {
  expanded: boolean;
  title: string;
}

const iconName = (state: boolean) => {
  return state ? 'collapse' : 'expand';
};

const ExpansionTitle: React.FunctionComponent<Props> = ({
  expanded,
  title,
  ...rest
}) => {
  return (
    <Root {...rest}>
      <Icon size={5} color="colors.actionSecondary" name={iconName(expanded)} />
      <Title type="small">{title}</Title>
    </Root>
  );
};

ExpansionTitle.defaultProps = {
  expanded: false,
  title: ''
};

export default ExpansionTitle;
