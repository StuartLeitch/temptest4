import React from 'react';
import {FlexboxProps, LayoutProps, SpaceProps} from 'styled-system';

import {SeparatorDirection, SeparatorFraction} from './SeparatorTypes';

import {Separator as Root} from './Separator.styles';

interface Props extends FlexboxProps, LayoutProps, SpaceProps {
  direction?: SeparatorDirection;
  fraction?: SeparatorFraction;
}

const Separator: React.FC<Props> = props => <Root {...props}></Root>;

Separator.defaultProps = {
  direction: 'vertical',
  fraction: 100
};

export default Separator;
